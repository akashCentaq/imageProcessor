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

export const getUserBillingRecords = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const googleId = req.user?.id;
        const { startDate, endDate } = req.query;

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

        // Build the where clause for date filtering
        const dateFilter: any = { userId: userId };
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) {
                dateFilter.createdAt.gte = new Date(startDate as string);
            }
            if (endDate) {
                dateFilter.createdAt.lte = new Date(endDate as string);
            }
        }

        // Fetch billing records for the authenticated user
        const billingRecords = await prisma.billingRecord.findMany({
            where: dateFilter,
            select: {
                id: true,
                orderId: true,
                service: {
                    select: {
                        name: true,
                    },
                },
                creditsUsed: true,
                createdAt: true,
            },
        });

        // Group billing records by orderId
        const groupedRecords: {
            [orderId: string]: Array<{
                id: string;
                serviceName: string;
                creditsUsed: number;
                createdAt: Date;
            }>
        } = {};

        billingRecords.forEach(record => {
            const orderId = record.orderId;
            if (!groupedRecords[orderId]) {
                groupedRecords[orderId] = [];
            }
            groupedRecords[orderId].push({
                id: record.id,
                serviceName: record.service.name,
                creditsUsed: record.creditsUsed,
                createdAt: record.createdAt,
            });
        });

        res.status(200).json({
            message: 'Billing records retrieved successfully',
            billingRecords: groupedRecords,
        });
    } catch (error) {
        console.error('Error fetching billing records:', error);
        res.status(500).json({ error: 'Failed to fetch billing records' });
    } finally {
        await prisma.$disconnect();
    }
};