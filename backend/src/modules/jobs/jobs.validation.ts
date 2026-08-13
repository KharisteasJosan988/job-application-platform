import { z } from 'zod';

const jobTypeEnum = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']);

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Judul minimal 3 karakter'),
    description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
    location: z.string().min(2, 'Lokasi wajib diisi'),
    salary: z.string().min(1, 'Salary wajib diisi'),
    jobType: jobTypeEnum,
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(2).optional(),
    salary: z.string().min(1).optional(),
    jobType: jobTypeEnum.optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Job id tidak valid'),
  }),
});

export const jobIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Job id tidak valid'),
  }),
});
