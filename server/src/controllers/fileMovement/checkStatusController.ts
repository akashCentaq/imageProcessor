import { Request, Response } from 'express';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../../config/database';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

export const checkOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const googleId = req.user?.id;
    const { orderId } = req.params;

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

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: user.id },
      include: { files: true },
    });
    if (!order) {
      res.status(404).json({ error: 'Order not found or user not authorized' });
      return;
    }

    const outgoingPath = `${user.id}/files/outgoing/${orderId}/`;
    const { Contents } = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: outgoingPath,
      })
    );

    const status = Contents && Contents.length > 0 ? 'completed' : 'processing';
    const downloadableFiles: { fileName: string; downloadUrl: string }[] = [];

    if (status === 'completed' && Contents) {
      await Promise.all(
        Contents.map(async (object) => {
          if (object.Key) {
            const fileName = object.Key.split('/').pop() || '';
            const downloadUrl = await getSignedUrl(
              s3Client,
              new GetObjectCommand({
                Bucket: BUCKET,
                Key: object.Key,
              }),
              { expiresIn: 3600 } // URL expires in 1 hour
            );
            downloadableFiles.push({ fileName, downloadUrl });
          }
        })
      );
    }

    res.status(200).json({
      orderId,
      status,
      files: downloadableFiles,
    });
  } catch (error: any) {
    console.error('Error checking order status:', error);
    res.status(500).json({ error: 'Failed to check order status', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
};