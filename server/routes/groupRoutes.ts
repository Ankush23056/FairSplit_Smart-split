import { Router } from 'express';
import { getGroups, createGroup, getGroupById, getGroupAnalytics } from '../controllers/groupController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getGroups);
router.post('/', createGroup);
router.get('/:id', getGroupById);
router.get('/:id/analytics', getGroupAnalytics);

export default router;
