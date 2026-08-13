import { z } from 'zod';

export const registerSchema = z.object({
  body: z
    .object({
      email: z.string().email('Email tidak valid'),
      password: z.string().min(6, 'Password minimal 6 karakter'),
      name: z.string().min(2, 'Nama minimal 2 karakter'),
      role: z.enum(['JOB_SEEKER', 'COMPANY'], {
        errorMap: () => ({ message: 'Role harus JOB_SEEKER atau COMPANY' }),
      }),
      companyName: z.string().min(2).optional(),
    })
    .refine((data) => data.role !== 'COMPANY' || !!data.companyName, {
      message: 'companyName wajib diisi untuk role COMPANY',
      path: ['companyName'],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
  }),
});
