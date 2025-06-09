import { Request, Response } from 'express';
import { prisma } from '../../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}


export const createPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated or missing user ID' });
      return;
    }

    const { paymentNumber, creditsPurchased, amountPaid } = req.body;

    // Validate request body
    if (!paymentNumber || typeof creditsPurchased !== 'number' || typeof amountPaid !== 'number') {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    if (creditsPurchased <= 0 || amountPaid < 0) {
      res.status(400).json({ error: 'Credits purchased must be positive and amount paid cannot be negative' });
      return;
    }

    // Check if paymentNumber is unique
    const existingPayment = await prisma.payment.findUnique({
      where: { paymentNumber },
    });

    if (existingPayment) {
      res.status(400).json({ error: 'Payment number already exists' });
      return;
    }

    // Create payment record and update user credits in a transaction
    const payment = await prisma.$transaction(async (prisma) => {
      // Create payment record
      const newPayment = await prisma.payment.create({
        data: {
          userId,
          paymentNumber,
          creditsPurchased,
          amountPaid,
        },
      });

      console.log('New payment record created:', newPayment);

      // Update user credits
      await prisma.user.update({
        where: { googleId: userId },
        data: {
          credits: {
            increment: creditsPurchased,
          },
        },
      });

      return newPayment;
    });

    res.status(201).json({
      message: 'Payment record created successfully',
      payment: {
        id: payment.id,
        paymentNumber: payment.paymentNumber,
        creditsPurchased: payment.creditsPurchased,
        amountPaid: payment.amountPaid,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating payment record:', error);
    res.status(500).json({ error: 'Failed to create payment record' });
  } finally {
    await prisma.$disconnect();
  }
};