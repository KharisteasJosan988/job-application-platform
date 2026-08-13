import { z } from 'zod';

const statusEnum = z.enum(['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED']);

export const applyJobSchema = z.object({
  body: z.object({
    jobId: z.string().uuid('Job id tidak valid'),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: statusEnum,
    note: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Application id tidak valid'),
  }),
});

export const jobIdParamSchema = z.object({
  params: z.object({
    jobId: z.string().uuid('Job id tidak valid'),
  }),
});
