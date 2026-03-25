import { Router } from 'express';
import { getExpenses, createExpense, getBalances, createSettlement } from '../controllers/expenseController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/:groupId', getExpenses);
router.post('/:groupId', createExpense);
router.post('/:groupId/settlements', createSettlement);
router.get('/:groupId/balances', getBalances);

export default router;
