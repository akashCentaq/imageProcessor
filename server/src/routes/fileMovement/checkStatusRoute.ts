import { Router } from 'express';
import { checkOrderStatus } from '../../controllers/fileMovement/checkStatusController';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /checkOrderStatus/{orderId}:
 *   get:
 *     summary: Check the status of an order and get downloadable file links
 *     tags: [S3]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to check
 *     responses:
 *       200:
 *         description: Order status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [processing, completed]
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileName:
 *                         type: string
 *                       downloadUrl:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:orderId', isAuthenticated, checkOrderStatus);

export default router;