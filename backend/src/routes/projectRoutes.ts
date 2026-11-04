import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleCheck';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorizeRoles('admin', 'manager', 'officer', 'agency'), createProject);
router.put('/:id', authorizeRoles('admin', 'manager', 'officer'), updateProject);
router.delete('/:id', authorizeRoles('admin'), deleteProject);

export default router;

