import { Router } from 'express';
import { getUserBillingRecords } from '../../controllers/transactions/fetchTransactionsControlller';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /transactions/fetchTransactions:
 *   get:
 *     summary: Fetch all billing records for the authenticated user, grouped by order
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering transactions (YYYY-MM-DD)
 *         required: false
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering transactions (YYYY-MM-DD)
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully retrieved billing records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 billingRecords:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         serviceName:
 *                           type: string
 *                         creditsUsed:
 *                           type: integer
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/fetchTransactions', isAuthenticated, getUserBillingRecords);

export default router;