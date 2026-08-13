import { Router } from 'express';
import {
  applyToJob,
  getApplicationHistory,
  listCandidatesForJob,
  listMyApplications,
  updateApplicationStatus,
} from './applications.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  applyJobSchema,
  jobIdParamSchema,
  updateStatusSchema,
} from './applications.validation';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Job Seeker
router.post('/', authorize('JOB_SEEKER'), validate(applyJobSchema), applyToJob);
router.get('/mine', authorize('JOB_SEEKER'), listMyApplications);

// Company
router.get(
  '/job/:jobId',
  authorize('COMPANY'),
  validate(jobIdParamSchema),
  listCandidatesForJob,
);
router.patch(
  '/:id/status',
  authorize('COMPANY'),
  validate(updateStatusSchema),
  updateApplicationStatus,
);

// Shared (owner job seeker OR owner company - checked inside controller)
router.get('/:id/history', getApplicationHistory);

export default router;
