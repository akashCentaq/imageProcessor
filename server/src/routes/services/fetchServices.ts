import { Router } from 'express';
import { getAllServices } from '../../controllers/services/fetchServiceController';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /services/fetchServices:
 *   get:
 *     summary: Fetch all services from the database
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       cost:
 *                         type: integer
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
router.get('/fetchServices', isAuthenticated, getAllServices);

export default router;