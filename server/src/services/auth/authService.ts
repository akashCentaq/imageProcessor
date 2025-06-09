// src/services/auth/authService.ts
import { prisma } from '../../config/database';
import { User } from '../../types';
import bcrypt from 'bcrypt';

export const findOrCreateUser = async (googleId: string, email: string, name: string): Promise<User> => {
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    user = await prisma.user.create({
      data: { googleId, email, name },
    });
  }

  return {
    id: user.id,
    googleId: user.googleId,
    email: user.email,
    name: user.name,
    password: user.password,
    phone_number: user.phone_number,
    lastPasswordChange: user.lastPasswordChange,
    createdAt: user.createdAt,
  };
};

export const createUser = async (
  email: string,
  password: string,
  phone_number?: string,
  googleId?: string,
  name?: string
): Promise<User> => {
  let hashedPassword: string | undefined;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      phone_number,
      googleId,
      name,
    },
  });

  return {
    id: user.id,
    googleId: user.googleId,
    email: user.email,
    name: user.name,
    password: user.password,
    phone_number: user.phone_number,
    lastPasswordChange: user.lastPasswordChange,
    createdAt: user.createdAt,
  };
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      googleId: true,
      email: true,
      role: true,
      name: true,
      password: true,
      phone_number: true,
      createdAt: true,
      lastPasswordChange: true,
    },
  });

  return user
    ? {
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        role: user.role,
        password: user.password,
        phone_number: user.phone_number,
        lastPasswordChange: user.lastPasswordChange,
        createdAt: user.createdAt,
      }
    : null;
};