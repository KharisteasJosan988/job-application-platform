import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../middlewares/error.middleware';
import { ForbiddenError, NotFoundError } from '../../utils/AppError';

// GET /api/jobs - list all active jobs (public to any authenticated user)
export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const { location, jobType, search } = req.query as {
    location?: string;
    jobType?: string;
    search?: string;
  };

  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
      ...(jobType ? { jobType: jobType as any } : {}),
      ...(search
        ? { title: { contains: search, mode: 'insensitive' } }
        : {}),
    },
    include: {
      company: { select: { id: true, name: true, companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ success: true, data: jobs });
});

// GET /api/jobs/:id - job detail
export const getJobDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true, companyName: true } },
    },
  });

  if (!job) {
    throw new NotFoundError('Lowongan tidak ditemukan');
  }

  res.status(200).json({ success: true, data: job });
});

// POST /api/jobs - create job (COMPANY only)
export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, location, salary, jobType } = req.body;

  const job = await prisma.job.create({
    data: {
      title,
      description,
      location,
      salary,
      jobType,
      companyId: req.user!.userId,
    },
  });

  res.status(201).json({ success: true, message: 'Lowongan berhasil dibuat', data: job });
});

// PATCH /api/jobs/:id - update job (owner COMPANY only)
export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    throw new NotFoundError('Lowongan tidak ditemukan');
  }
  if (job.companyId !== req.user!.userId) {
    throw new ForbiddenError('Anda tidak memiliki akses ke lowongan ini');
  }

  const updated = await prisma.job.update({
    where: { id },
    data: req.body,
  });

  res.status(200).json({ success: true, message: 'Lowongan berhasil diperbarui', data: updated });
});

// GET /api/jobs/company/mine - list jobs posted by the logged-in company
export const listMyJobs = asyncHandler(async (req: Request, res: Response) => {
  const jobs = await prisma.job.findMany({
    where: { companyId: req.user!.userId },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ success: true, data: jobs });
});
