import { Router } from 'express';
import { uploadFiles } from '../../controllers/fileMovement/uploadController';
import { isAuthenticated } from '../../middleware/authMiddleware';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload files to S3 bucket and associate with an order
 *     tags: [S3]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *               - serviceIds
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               serviceIds:
 *                 type: string
 *                 description: JSON string of service IDs (e.g., "[\"serviceId1\", \"serviceId2\"]")
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: string
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileName:
 *                         type: string
 *                       filePath:
 *                         type: string
 *                 services:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request (e.g., no files or service IDs provided)
 *       500:
 *         description: Server error
 */
router.post('/', isAuthenticated, upload.array('files'), uploadFiles);

export default router;