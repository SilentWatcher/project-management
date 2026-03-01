import express from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import {
  requireProjectRole,
  PERMISSIONS
} from '../middleware/authorization.js';
import {
  validateProject,
  validateProjectId,
  validateAddMember
} from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Project CRUD
router.post('/', validateProject, createProject);
router.get('/', getProjects);
router.get('/:projectId', validateProjectId, getProject);
router.put(
  '/:projectId',
  validateProjectId,
  requireProjectRole(PERMISSIONS.MANAGE_PROJECT),
  validateProject,
  updateProject
);
router.delete(
  '/:projectId',
  validateProjectId,
  requireProjectRole(PERMISSIONS.MANAGE_PROJECT),
  deleteProject
);

// Member management
router.post(
  '/:projectId/members',
  validateProjectId,
  requireProjectRole(PERMISSIONS.MANAGE_MEMBERS),
  validateAddMember,
  addMember
);
router.delete(
  '/:projectId/members/:userId',
  validateProjectId,
  requireProjectRole(PERMISSIONS.MANAGE_MEMBERS),
  removeMember
);
router.put(
  '/:projectId/members/:userId/role',
  validateProjectId,
  requireProjectRole(PERMISSIONS.MANAGE_MEMBERS),
  updateMemberRole
);

export default router;
