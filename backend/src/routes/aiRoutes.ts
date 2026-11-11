import { Router } from 'express';
import { handleAiQuery, getProjectAiAudit, getAiStatus, resetTokenStats } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/status', getAiStatus);
router.post('/tokens/reset', resetTokenStats);
router.post('/chat', handleAiQuery);
router.get('/audit/:projectId', getProjectAiAudit);

export default router;
