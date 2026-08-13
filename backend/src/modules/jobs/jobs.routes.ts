import { Router } from 'express';
import {
  createJob,
  getJobDetail,
  listJobs,
  listMyJobs,
  updateJob,
} from './jobs.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createJobSchema, jobIdParamSchema, updateJobSchema } from './jobs.validation';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// All job routes require authentication
router.use(authenticate);

// IMPORTANT: static path must be registered before the dynamic '/:id' path
router.get('/company/mine', authorize('COMPANY'), listMyJobs);

router.get('/', listJobs);
router.get('/:id', validate(jobIdParamSchema), getJobDetail);
router.post('/', authorize('COMPANY'), validate(createJobSchema), createJob);
router.patch('/:id', authorize('COMPANY'), validate(updateJobSchema), updateJob);

export default router;
