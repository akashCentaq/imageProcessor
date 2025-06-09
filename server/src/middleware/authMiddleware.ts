// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseAdmin';

// Define User interface to match expected type
interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach user info to req.user
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: decodedToken.role, // Custom claim for role, if set
    };
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};