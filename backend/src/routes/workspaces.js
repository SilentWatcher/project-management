import express from 'express';
import {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  getWorkspaceWithProjects
} from '../controllers/workspaceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Workspace CRUD
router.route('/')
  .get(getWorkspaces)
  .post(createWorkspace);

router.route('/:workspaceId')
  .get(getWorkspaceById)
  .put(updateWorkspace)
  .delete(deleteWorkspace);

router.route('/:workspaceId/projects')
  .get(getWorkspaceWithProjects);

// Workspace members
router.route('/:workspaceId/members')
  .post(addWorkspaceMember);

router.route('/:workspaceId/members/:memberId')
  .delete(removeWorkspaceMember);

export default router;
