import express from 'express';
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard
} from '../controllers/boardController.js';
import { authenticate } from '../middleware/auth.js';
import {
  requireProjectRole,
  canAccessBoard,
  PERMISSIONS
} from '../middleware/authorization.js';
import {
  validateBoard,
  validateProjectId,
  validateBoardId
} from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Board routes under project
router.post(
  '/project/:projectId',
  validateProjectId,
  requireProjectRole(PERMISSIONS.CREATE_TASK),
  validateBoard,
  createBoard
);

router.get(
  '/project/:projectId',
  validateProjectId,
  requireProjectRole(PERMISSIONS.VIEW),
  getBoards
);

// Individual board routes
router.get(
  '/:boardId',
  validateBoardId,
  canAccessBoard,
  getBoard
);

router.put(
  '/:boardId',
  validateBoardId,
  canAccessBoard,
  requireProjectRole(PERMISSIONS.MANAGE_PROJECT),
  validateBoard,
  updateBoard
);

router.delete(
  '/:boardId',
  validateBoardId,
  canAccessBoard,
  requireProjectRole(PERMISSIONS.MANAGE_PROJECT),
  deleteBoard
);

export default router;
