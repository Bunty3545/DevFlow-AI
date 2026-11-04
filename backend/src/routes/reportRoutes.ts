import { Router } from 'express';
import { exportProjectsExcel, exportProjectsCSV, getComprehensiveReport } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/comprehensive', getComprehensiveReport);
router.get('/export/excel', exportProjectsExcel);
router.get('/export/csv', exportProjectsCSV);

export default router;

