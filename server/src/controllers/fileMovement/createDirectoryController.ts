import { Request, Response } from 'express';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

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

export const createDirectories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated or missing user ID' });
      return;
    }

    const prefix = `${userId}/files/`;
    const directories = ['incoming/', 'outgoing/'];
    const existingDirectories: string[] = [];

    // Check which directories already exist
    await Promise.all(
      directories.map(async (dir) => {
        try {
          await s3Client.send(
            new HeadObjectCommand({
              Bucket: BUCKET,
              Key: prefix + dir,
            })
          );
          existingDirectories.push(prefix + dir);
        } catch (error: any) {
          // If error is 404, directory doesn't exist
          if (error.name !== 'NotFound') {
            throw error;
          }
        }
      })
    );

    // If all directories exist, return early
    if (existingDirectories.length === directories.length) {
      res.status(200).json({
        message: 'All directories already exist',
        directories: existingDirectories,
      });
      return;
    }

    // Create only non-existing directories
    const directoriesToCreate = directories.filter(
      (dir) => !existingDirectories.includes(prefix + dir)
    );

    await Promise.all(
      directoriesToCreate.map(async (dir) => {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: prefix + dir,
            Body: '',
          })
        );
      })
    );

    res.status(200).json({
      message: directoriesToCreate.length > 0 
        ? 'Directories created successfully' 
        : 'Some directories already exist',
      directories: directories.map(dir => prefix + dir),
      created: directoriesToCreate.map(dir => prefix + dir),
      existing: existingDirectories,
    });
  } catch (error) {
    console.error('Error creating directories:', error);
    res.status(500).json({ error: 'Failed to create directories' });
  }
};