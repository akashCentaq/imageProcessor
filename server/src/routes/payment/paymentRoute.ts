import { Router } from 'express';
import { createPayment } from '../../controllers/payment/paymentController';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /payment/create:
 *   post:
 *     summary: Create a payment record and update user credits
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentNumber
 *               - creditsPurchased
 *               - amountPaid
 *             properties:
 *               paymentNumber:
 *                 type: string
 *                 description: Unique transaction ID from payment provider
 *               creditsPurchased:
 *                 type: integer
 *                 description: Number of credits purchased
 *               amountPaid:
 *                 type: integer
 *                 description: Amount paid in smallest currency unit (e.g., paise or cents)
 *     responses:
 *       201:
 *         description: Payment record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     paymentNumber:
 *                       type: string
 *                     creditsPurchased:
 *                       type: integer
 *                     amountPaid:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/create', isAuthenticated, createPayment);

export default router;