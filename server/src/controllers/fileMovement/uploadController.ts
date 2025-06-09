import { Request, Response } from 'express';
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT as string,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY as string,
    secretAccessKey: process.env.DO_SPACES_SECRET as string,
  },
});
const BUCKET = process.env.SPACES_BUCKET as string;

// Function to create directories
const createDirectories = async (userId: string): Promise<string[]> => {
  const prefix = `${userId}/files/`;
  const directories = ['incoming/', 'outgoing/'];
  const existingDirectories: string[] = [];

  await Promise.all(
    directories.map(async (dir) => {
      try {
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: BUCKET,
            Key: `${prefix}${dir}`,
          })
        );
        existingDirectories.push(`${prefix}${dir}`);
      } catch (error: any) {
        if (error.name !== 'NotFound') {
          throw error;
        }
      }
    })
  );

  const directoriesToCreate = directories.filter(
    (dir) => !existingDirectories.includes(`${prefix}${dir}`)
  );

  await Promise.all(
    directoriesToCreate.map(async (dir) => {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: `${prefix}${dir}`,
          Body: '',
        })
      );
    })
  );

  return directories.map(dir => `${prefix}${dir}`);
};

export const uploadFiles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const googleId = req.user?.id;
    console.log('Request body:', req.body);
    if (!googleId) {
      res.status(401).json({ error: 'User not authenticated or missing user ID' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { googleId: googleId },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found in the database' });
      return;
    }

    const userId = user.id;

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    let serviceIds: string[] = [];
    const rawServiceIds = req.body.serviceIds;
    if (typeof rawServiceIds === 'string') {
      try {
        serviceIds = JSON.parse(rawServiceIds).map((id: string) => id.trim());
      } catch (error) {
        res.status(400).json({ error: 'Invalid serviceIds format: must be a JSON array of strings' });
        return;
      }
    } else if (Array.isArray(rawServiceIds)) {
      serviceIds = rawServiceIds.map((id: string) => id.trim());
    }

    if (!serviceIds || serviceIds.length === 0) {
      res.status(400).json({ error: 'No service IDs provided' });
      return;
    }

    const existingServices = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
      },
    });

    if (existingServices.length !== serviceIds.length) {
      res.status(400).json({ error: 'One or more service IDs are invalid' });
      return;
    }

    // Calculate total cost (sum of service costs * number of files)
    const totalServiceCost = existingServices.reduce((sum, service) => sum + service.cost, 0);
    const totalOrderCost = totalServiceCost * files.length;

    // Check if user has enough credits
    if (user.credits < totalOrderCost) {
      res.status(400).json({ error: 'Insufficient credits for this order' });
      return;
    }

    await createDirectories(userId);

    const orderId = uuidv4();
    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await Promise.all(
      serviceIds.map(async (serviceId) => {
        await prisma.orderService.create({
          data: {
            id: uuidv4(),
            orderId,
            serviceId,
            createdAt: new Date(),
          },
        });
      })
    );

    const uploadedFiles: { fileName: string; filePath: string }[] = [];

    // Create billing records and upload files
    await Promise.all(
      files.map(async (file) => {
        const fileName = file.originalname;
        const filePath = `${userId}/files/incoming/${orderId}/${fileName}`;
        const fileId = uuidv4();

        // Upload file to S3
        if (file.size > 5 * 1024 * 1024) {
          const { UploadId } = await s3Client.send(
            new CreateMultipartUploadCommand({
              Bucket: BUCKET,
              Key: filePath,
            })
          );

          const chunkSize = 5 * 1024 * 1024;
          const chunks = Math.ceil(file.size / chunkSize);
          const uploadParts = [];

          for (let i = 0; i < chunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.buffer.subarray(start, end);

            const { ETag } = await s3Client.send(
              new UploadPartCommand({
                Bucket: BUCKET,
                Key: filePath,
                UploadId: UploadId!,
                PartNumber: i + 1,
                Body: chunk,
              })
            );

            uploadParts.push({ ETag, PartNumber: i + 1 });
          }

          await s3Client.send(
            new CompleteMultipartUploadCommand({
              Bucket: BUCKET,
              Key: filePath,
              UploadId: UploadId!,
              MultipartUpload: { Parts: uploadParts },
            })
          );
        } else {
          await s3Client.send(
            new PutObjectCommand({
              Bucket: BUCKET,
              Key: filePath,
              Body: file.buffer,
              ContentType: file.mimetype,
            })
          );
        }

        // Create file record
        const fileRecord = await prisma.file.create({
          data: {
            id: fileId,
            orderId,
            fileName,
            filePath,
            createdAt: new Date(),
          },
        });

        // Create incoming record
        await prisma.incoming.create({
          data: {
            id: uuidv4(),
            fileId: fileRecord.id,
            orderId,
            processed: false,
            createdAt: new Date(),
          },
        });

        // Create billing records for each service
        await Promise.all(
          existingServices.map(async (service) => {
            await prisma.billingRecord.create({
              data: {
                id: uuidv4(),
                userId,
                orderId,
                serviceId: service.id,
                creditsUsed: service.cost,
                createdAt: new Date(),
              },
            });
          })
        );

        uploadedFiles.push({ fileName, filePath });
      })
    );

    // Update user's credits and totalCreditUsage
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: totalOrderCost,
        },
        totalCreditUsage: {
          increment: totalOrderCost,
        },
      },
    });

    // Fetch service names for the provided service IDs
    const serviceNames = existingServices.map(service => service.name);

    // Construct the order path
    const orderPath = uploadedFiles.length > 0
      ? `${userId}/files/incoming/${orderId}/`
      : `${userId}/files/incoming/${orderId}/`;

    // Make POST request to the other server
    try {
      await axios.post(process.env.AI_SERVER_PATH as string, {
        services: serviceNames,
        orderId: orderId,
        order_path: orderPath,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (postError: any) {
      console.error('Error sending POST request to other server:', postError.message);
    }

    res.status(200).json({
      message: 'Files uploaded successfully',
      orderId,
      files: uploadedFiles,
      services: serviceIds,
      totalCost: totalOrderCost,
    });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    if (error.code === 'P2003') {
      res.status(400).json({ error: 'Invalid user ID or service ID: Referenced entity does not exist' });
    } else {
      res.status(500).json({ error: 'Failed to upload files', details: error.message });
    }
  } finally {
    await prisma.$disconnect();
  }
};