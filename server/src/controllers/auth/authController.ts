import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateEmail, validatePhoneNumber } from '../../utils/validation';
import bcrypt from 'bcrypt';
import admin, { firebaseAuth } from '../../config/firebaseAdmin';
import { sendEmail } from '../../utils/sendEmail';

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, confirm_password, phone_number, name, googleId } = req.body;

    // Validate input
    if (!email || !password || !confirm_password) {
      res.status(400).json({ error: 'Email, password, and confirm_password are required' });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({ error: 'Passwords do not match' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (phone_number && !validatePhoneNumber(phone_number)) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }

    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(200).json({ message: 'Welcome Back!' });
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in Prisma
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        phone_number: phone_number || null,
        googleId: googleId || null,
        role: 'User',
        plan: 'Free',
      },
    });

    res.status(201).json({
      userId: user.googleId || user.id,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    [key: string]: any;
  };
}

export const resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get email from request body instead of authenticated user
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required in the request body' });
      return;
    }

    // Validate email format (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Send password reset email via Firebase
    const resetLink = await firebaseAuth.generatePasswordResetLink(email, {
      url: process.env.CLIENT_URL || 'http://localhost:5173/profile',
      handleCodeInApp: true,
    });

    // Send email with the reset link
    await sendEmail({
      to: email,
      subject: 'Reset Your Password - Image Processor',
      html: `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); overflow: hidden;">
      <tr>
        <td style="padding: 32px 32px 16px; text-align: center; background-color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #2e3a59;">Reset Your Password</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 32px 24px; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
          <p style="margin: 0 0 16px;">Hi there,</p>
          <p style="margin: 0 0 16px;">
            We received a request to reset your password for your <strong>Image Processor</strong> account.
            Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" target="_blank"
              style="display: inline-block; padding: 14px 28px; background-color: #2563eb; background-image: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
              Reset Password
            </a>
          </div>
          <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
            If you didn’t request this, you can safely ignore this email. This link will expire in <strong>1 hour</strong> for your security.
          </p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; text-align: center; font-size: 13px; color: #9ca3af;">
            © ${new Date().getFullYear()} Image Processor. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </div>
  `,
    });

    console.log('Password reset link generated:', resetLink);

    res.status(200).json({ message: 'Password reset email sent', resetLink });
  } catch (error: any) {
    console.error('Password reset error:', error);
    if (error.code === 'auth/user-not-found') {
      res.status(400).json({ error: 'No user found with this email' });
    } else if (error.code === 'auth/invalid-email') {
      res.status(400).json({ error: 'Invalid email address' });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
    next(error);
  }
};