import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

const prisma = new PrismaClient();

export const getAllServices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated or missing user ID' });
      return;
    }

    // Fetch all services from the database
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        cost: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'Services retrieved successfully',
      services,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  } finally {
    await prisma.$disconnect();
  }
};