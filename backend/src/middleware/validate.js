import { body, param, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';
import mongoose from 'mongoose';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Check if value is valid MongoDB ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Auth validations
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Project validations
export const validateProject = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors
];

export const validateProjectId = [
  param('projectId')
    .custom(isValidObjectId).withMessage('Invalid project ID'),
  handleValidationErrors
];

// Board validations
export const validateBoard = [
  body('name')
    .trim()
    .notEmpty().withMessage('Board name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors
];

export const validateBoardId = [
  param('boardId')
    .custom(isValidObjectId).withMessage('Invalid board ID'),
  handleValidationErrors
];

// Column validations
export const validateColumn = [
  body('name')
    .trim()
    .notEmpty().withMessage('Column name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  handleValidationErrors
];

// Task validations
export const validateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('assignee')
    .optional()
    .custom((value) => {
      if (value && !isValidObjectId(value)) {
        throw new Error('Invalid assignee ID');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateTaskId = [
  param('taskId')
    .custom(isValidObjectId).withMessage('Invalid task ID'),
  handleValidationErrors
];

export const validateTaskMove = [
  body('sourceColumnId')
    .custom(isValidObjectId).withMessage('Invalid source column ID'),
  body('destinationColumnId')
    .custom(isValidObjectId).withMessage('Invalid destination column ID'),
  body('sourceIndex')
    .isInt({ min: 0 }).withMessage('Source index must be a non-negative integer'),
  body('destinationIndex')
    .isInt({ min: 0 }).withMessage('Destination index must be a non-negative integer'),
  handleValidationErrors
];

// Comment validation
export const validateComment = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  handleValidationErrors
];

// Member validation
export const validateAddMember = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'member', 'viewer']).withMessage('Role must be admin, member, or viewer'),
  handleValidationErrors
];
