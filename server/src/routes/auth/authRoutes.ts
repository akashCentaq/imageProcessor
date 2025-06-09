import { Router, Request, Response, NextFunction } from 'express';
import { createUser, resetPassword } from '../../controllers/auth/authController';
import { isAuthenticated } from '../../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /auth/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               confirm_password:
 *                 type: string
 *                 example: Password123!
 *               phone_number:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Invalid input
 */
router.post('/create', (req: Request, res: Response, next: NextFunction) => createUser(req, res, next));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Send a password reset email
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset email sent
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', (req: Request, res: Response, next: NextFunction) => resetPassword(req, res, next));



export default router;