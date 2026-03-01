import Project from '../models/Project.js';
import Board from '../models/Board.js';
import Task from '../models/Task.js';
import { AppError } from './errorHandler.js';

// Cache for user roles (in-memory, replace with Redis for production)
const roleCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedRole = (userId, projectId) => {
  const key = `${userId}:${projectId}`;
  const cached = roleCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.role;
  }
  roleCache.delete(key);
  return null;
};

const setCachedRole = (userId, projectId, role) => {
  const key = `${userId}:${projectId}`;
  roleCache.set(key, { role, timestamp: Date.now() });
};

// Get user's role in a project
export const getUserProjectRole = async (userId, projectId) => {
  // Check cache first
  const cached = getCachedRole(userId, projectId);
  if (cached) return cached;

  const project = await Project.findById(projectId);
  if (!project) return null;

  const role = project.getUserRole(userId);
  if (role) {
    setCachedRole(userId, projectId, role);
  }
  return role;
};

// Middleware to check project-level permissions
export const requireProjectRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const userId = req.user._id;

      // If projectId is not in params, check if it was set by previous middleware (e.g., canAccessBoard)
      let projectIdToCheck = projectId;
      
      if (!projectIdToCheck && req.board) {
        projectIdToCheck = req.board.project;
      }

      if (!projectIdToCheck) {
        return next(new AppError('Project ID required', 400));
      }

      const role = await getUserProjectRole(userId, projectIdToCheck);

      if (!role) {
        return next(new AppError('Access denied - not a project member', 403));
      }

      if (!allowedRoles.includes(role)) {
        return next(new AppError('Insufficient permissions', 403));
      }

      req.userProjectRole = role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user can access a board
export const canAccessBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user._id;

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError('Board not found', 404));
    }

    const role = await getUserProjectRole(userId, board.project);
    if (!role) {
      return next(new AppError('Access denied', 403));
    }

    req.board = board;
    req.userProjectRole = role;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user can access a task
export const canAccessTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    const role = await getUserProjectRole(userId, task.project);
    if (!role) {
      return next(new AppError('Access denied', 403));
    }

    req.task = task;
    req.userProjectRole = role;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if user can modify task (admin, member, or task creator/assignee)
export const canModifyTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    const role = await getUserProjectRole(userId, task.project);
    
    // Admins and members can modify any task
    if (role === 'admin' || role === 'member') {
      req.task = task;
      req.userProjectRole = role;
      return next();
    }

    // Viewers can only modify their own tasks
    if (role === 'viewer' && task.createdBy.toString() === userId.toString()) {
      req.task = task;
      req.userProjectRole = role;
      return next();
    }

    return next(new AppError('Insufficient permissions to modify this task', 403));
  } catch (error) {
    next(error);
  }
};

// Role hierarchy for permission checks
export const ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

// Permission levels
export const PERMISSIONS = {
  VIEW: [ROLES.ADMIN, ROLES.MEMBER, ROLES.VIEWER],
  CREATE_TASK: [ROLES.ADMIN, ROLES.MEMBER],
  MODIFY_TASK: [ROLES.ADMIN, ROLES.MEMBER],
  DELETE_TASK: [ROLES.ADMIN, ROLES.MEMBER],
  MANAGE_PROJECT: [ROLES.ADMIN],
  MANAGE_MEMBERS: [ROLES.ADMIN]
};
