// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth/authRoutes';
import userRoutes from './auth/userRoutes';
import uploadRoute from './fileMovement/uplaodRoute';
import createDirectoriesRoute from './fileMovement/createDirectoryRoute';
import { isAuthenticated } from '../middleware/authMiddleware';
import fetchServices from './services/fetchServices';
import checkStatusRoute from './fileMovement/checkStatusRoute';
import fetchTransactionsRoute from './transactions/fetchTransactionsRoute';

const router = Router();

// Mount individual route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/fileMovement', createDirectoriesRoute);
router.use('/fileUpload', uploadRoute);
router.use('/services', fetchServices);
router.use('/checkOrderStatus', checkStatusRoute);
router.use('/transactions', fetchTransactionsRoute);

// Example protected route
router.get('/protected', isAuthenticated, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

export default router;