import { Router } from 'express';
import { createDirectories } from '../../controllers/fileMovement/createDirectoryController';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /fileMovement/createDirectories:
 *   post:
 *     summary: Create directories in S3 bucket
 *     tags: [S3]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Directories created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 directories:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/createDirectories', isAuthenticated, createDirectories);

export default router;