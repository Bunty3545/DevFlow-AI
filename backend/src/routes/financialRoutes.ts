import { Router } from 'express';
import { getFinancialOverview, addExpenditure } from '../controllers/financialController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleCheck';

const router = Router();

router.use(authenticate);

router.get('/overview', getFinancialOverview);
router.post('/expenditures', authorizeRoles('admin', 'manager', 'agency'), addExpenditure);

export default router;

