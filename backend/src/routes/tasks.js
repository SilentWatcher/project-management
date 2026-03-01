import express from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
  getMyTasks,
  getDashboardStats
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import {
  canAccessBoard,
  canAccessTask,
  canModifyTask,
  requireProjectRole,
  PERMISSIONS
} from '../middleware/authorization.js';
import {
  validateTask,
  validateBoardId,
  validateTaskId,
  validateComment
} from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// My tasks
router.get('/my-tasks', getMyTasks);

// Task routes under board
router.post(
  '/board/:boardId',
  validateBoardId,
  canAccessBoard,
  requireProjectRole(PERMISSIONS.CREATE_TASK),
  validateTask,
  createTask
);

router.get(
  '/board/:boardId',
  validateBoardId,
  canAccessBoard,
  requireProjectRole(PERMISSIONS.VIEW),
  getTasks
);

// Individual task routes
router.get(
  '/:taskId',
  validateTaskId,
  canAccessTask,
  getTask
);

router.put(
  '/:taskId',
  validateTaskId,
  canModifyTask,
  validateTask,
  updateTask
);

router.delete(
  '/:taskId',
  validateTaskId,
  canModifyTask,
  deleteTask
);

// Comment routes
router.post(
  '/:taskId/comments',
  validateTaskId,
  canAccessTask,
  validateComment,
  addComment
);

router.delete(
  '/:taskId/comments/:commentId',
  validateTaskId,
  canAccessTask,
  deleteComment
);

export default router;
