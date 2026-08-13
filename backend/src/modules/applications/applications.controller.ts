import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { asyncHandler } from '../../middlewares/error.middleware';
import { ConflictError, ForbiddenError, NotFoundError } from '../../utils/AppError';

// POST /api/applications - Job Seeker applies to a job
export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.body;
  const jobSeekerId = req.user!.userId;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || !job.isActive) {
    throw new NotFoundError('Lowongan tidak ditemukan atau sudah tidak aktif');
  }

  // Requirement #5: a job seeker cannot apply to the same job more than once.
  // Guarded both here (friendly error) and at the DB level via the
  // @@unique([jobId, jobSeekerId]) constraint (race-condition safe).
  const existing = await prisma.application.findUnique({
    where: { jobId_jobSeekerId: { jobId, jobSeekerId } },
  });
  if (existing) {
    throw new ConflictError('Anda sudah pernah melamar pekerjaan ini');
  }

  const application = await prisma.application.create({
    data: {
      jobId,
      jobSeekerId,
      status: 'APPLIED',
      history: {
        create: { status: 'APPLIED', note: 'Lamaran dikirim' },
      },
    },
    include: { job: true, history: true },
  });

  res.status(201).json({
    success: true,
    message: 'Lamaran berhasil dikirim',
    data: application,
  });
});

// GET /api/applications/mine - Job Seeker's own applications with status
export const listMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const applications = await prisma.application.findMany({
    where: { jobSeekerId: req.user!.userId },
    include: {
      job: {
        include: { company: { select: { id: true, name: true, companyName: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ success: true, data: applications });
});

// GET /api/applications/:id/history - full status history of one application
export const getApplicationHistory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: { history: { orderBy: { changedAt: 'asc' } }, job: true },
  });

  if (!application) {
    throw new NotFoundError('Lamaran tidak ditemukan');
  }

  const isOwner = application.jobSeekerId === req.user!.userId;
  const isJobOwner = application.job.companyId === req.user!.userId;
  if (!isOwner && !isJobOwner) {
    throw new ForbiddenError('Anda tidak memiliki akses ke lamaran ini');
  }

  res.status(200).json({ success: true, data: application.history });
});

// GET /api/applications/job/:jobId - Company sees candidates for its own job
export const listCandidatesForJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new NotFoundError('Lowongan tidak ditemukan');
  }
  if (job.companyId !== req.user!.userId) {
    throw new ForbiddenError('Anda tidak memiliki akses ke lowongan ini');
  }

  const applications = await prisma.application.findMany({
    where: { jobId },
    include: {
      jobSeeker: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ success: true, data: applications });
});

// PATCH /api/applications/:id/status - Company updates candidate status
export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const application = await prisma.application.findUnique({
    where: { id },
    include: { job: true },
  });

  if (!application) {
    throw new NotFoundError('Lamaran tidak ditemukan');
  }
  if (application.job.companyId !== req.user!.userId) {
    throw new ForbiddenError('Anda tidak memiliki akses ke lamaran ini');
  }

  // Requirement #9: every status change must be persisted in application history.
  // Done atomically via a transaction so the application status and its
  // history entry never go out of sync.
  const [updated] = await prisma.$transaction([
    prisma.application.update({
      where: { id },
      data: { status },
    }),
    prisma.applicationHistory.create({
      data: { applicationId: id, status, note },
    }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Status lamaran berhasil diperbarui',
    data: updated,
  });
});
