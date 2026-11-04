import { Router } from 'express';
import { getIssues, createIssue, updateIssue } from '../controllers/issueController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getIssues);
router.post('/', createIssue);
router.put('/:id', updateIssue);

export default router;

