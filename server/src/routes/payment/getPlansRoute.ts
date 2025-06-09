import { Router } from 'express';
import { getAllPlans } from '../../controllers/payment/getPlansController';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /plans/fetchPlans:
 *   get:
 *     summary: Fetch all pricing plans from the database
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all pricing plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 plans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       credits:
 *                         type: integer
 *                       validityDays:
 *                         type: integer
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/fetchPlans', isAuthenticated, getAllPlans);

export default router;