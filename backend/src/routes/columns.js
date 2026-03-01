import express from 'express';
import {
  createColumn,
  getColumns,
  updateColumn,
  deleteColumn,
  reorderColumns,
  moveTask
} from '../controllers/columnController.js';
import { authenticate } from '../middleware/auth.js';
import {
  canAccessBoard,
  requireProjectRole,
  PERMISSIONS
} from '../middleware/authorization.js';
import {
  validateColumn,
  validateBoardId,
  validateTaskMove
} from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Column routes under board
router.post(
  '/board/:boardId',
  validateBoardId,
  canAccessBoard,
  requireProjectRole(PERMISSIONS.CREATE_TASK),
  validateColumn,
  createColumn
);

router.get(
  '/board/:boardId',
  validateBoardId,
  canAccessBoard,
  requireProjectRole(PERMISSIONS.VIEW),
  getColumns
);

router.put(
  '/board/:boardId/reorder',
  validateBoardId,
  canAccessBoard,
  requireProjectRole(PERMISSIONS.MODIFY_TASK),
  reorderColumns
);

// Move task (drag and drop)
router.post(
  '/move-task',
  validateTaskMove,
  moveTask
);

// Individual column routes
router.put(
  '/:columnId',
  requireProjectRole(PERMISSIONS.MODIFY_TASK),
  validateColumn,
  updateColumn
);

router.delete(
  '/:columnId',
  requireProjectRole(PERMISSIONS.MANAGE_PROJECT),
  deleteColumn
);

export default router;
