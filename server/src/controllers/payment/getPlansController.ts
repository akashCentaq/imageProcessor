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

export const getAllPlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated or missing user ID' });
      return;
    }

    // Fetch all pricing plans from the database
    const plans = await prisma.pricingPlan.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        credits: true,
        validityDays: true,
        features: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'Pricing plans retrieved successfully',
      plans,
    });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  } finally {
    await prisma.$disconnect();
  }
};