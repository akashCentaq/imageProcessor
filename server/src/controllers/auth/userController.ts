// src/controllers/auth/userController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    [key: string]: any;
  };
}

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  console.log('Fetching user profile for ID:', req.user.id);

  try {
    // Fetch user from the database using the Firebase UID (stored in googleId)
    const user = await prisma.user.findUnique({
      where: {
        googleId: req.user.id, // Use Firebase UID
      },
    });

    // If user not found, return 404
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    console.log('User profile fetched successfully: bsahcdbjdsbchbsjhdbcjbsdcbjdbcjhs ::: ', user);

    // Construct the response object
    const response = {
      id: user.googleId,
      email: user.email,
      phoneNumber: user.phone_number || '',
      joinDate: user.createdAt.toISOString(),
      name: user.name || '', // Use empty string if name is null
      avatar: '', // Assuming no avatar field in the schema, default to empty string
      credits: user.credits || 0, // Assuming no credits field in the schema, default to 0
      number_verified: user.number_verified || false, // Assuming no number_verified field in the schema, default to false
      usage: user.totalCreditUsage || 0, // Assuming no usage field in the schema, default to 0
      role: user.role,
      plan: user.plan,
    };

    // Send the response
    res.json(response);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { name, phoneNumber } = req.body;

  // Validate input
  if (!name && !phoneNumber) {
    res.status(400).json({ message: 'At least one field (name or phoneNumber) must be provided' });
    return;
  }

  // Optional: Add additional validation for name and phoneNumber
  if (name && typeof name !== 'string') {
    res.status(400).json({ message: 'Name must be a string' });
    return;
  }
  if (phoneNumber && typeof phoneNumber !== 'string') {
    res.status(400).json({ message: 'Phone number must be a string' });
    return;
  }

  try {
    // Update user in the database using Firebase UID
    const updatedUser = await prisma.user.update({
      where: {
        googleId: req.user.id, // Use Firebase UID
      },
      data: {
        name: name || undefined,
        phone_number: phoneNumber || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone_number: true,
        role: true,
        createdAt: true,
      },
    });

    // Construct response to match Swagger schema
    const response = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || '',
      phoneNumber: updatedUser.phone_number || '',
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};