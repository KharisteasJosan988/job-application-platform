import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { signToken } from '../../utils/jwt';
import { asyncHandler } from '../../middlewares/error.middleware';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../utils/AppError';

const SALT_ROUNDS = 10;

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  companyName: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: user.companyName,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role, companyName } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('Email sudah terdaftar');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      companyName: role === 'COMPANY' ? companyName : null,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });

  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil',
    data: { user: toPublicUser(user), token },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Email atau password salah');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new UnauthorizedError('Email atau password salah');
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.status(200).json({
    success: true,
    message: 'Login berhasil',
    data: { user: toPublicUser(user), token },
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    throw new NotFoundError('User tidak ditemukan');
  }
  res.status(200).json({ success: true, data: { user: toPublicUser(user) } });
});
