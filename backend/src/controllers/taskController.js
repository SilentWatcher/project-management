import Task from '../models/Task.js';
import Column from '../models/Column.js';
import Board from '../models/Board.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

// Create new task
export const createTask = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const {
    title,
    description,
    priority = 'medium',
    dueDate,
    assignee,
    columnId
  } = req.body;

  // Get board to find project
  const board = await Board.findById(boardId);
  if (!board) {
    throw new AppError('Board not found', 404);
  }

  // Get column or use first column
  let column;
  if (columnId) {
    column = await Column.findById(columnId);
  } else {
    column = await Column.findOne({ board: boardId }).sort({ order: 1 });
  }

  if (!column) {
    throw new AppError('Column not found', 404);
  }

  // Create task
  const task = await Task.create({
    title,
    description,
    priority,
    dueDate,
    assignee: assignee || null,
    column: column._id,
    board: boardId,
    project: board.project,
    createdBy: req.user._id,
    status: getStatusFromColumnName(column.name)
  });

  // Add task to column
  column.taskIds.push(task._id);
  await column.save();

  // Populate and return
  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  res.status(201).json({
    status: 'success',
    message: 'Task created successfully',
    data: { task: populatedTask }
  });
});

// Get tasks for a board
export const getTasks = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { priority, status, assignee, search } = req.query;

  const filter = { board: boardId };

  if (priority) filter.priority = priority;
  if (status) filter.status = status;
  if (assignee) filter.assignee = assignee;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.user', 'name email avatar')
    .sort({ createdAt: -1 });

  res.json({
    status: 'success',
    data: { tasks }
  });
});

// Get single task
export const getTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.user', 'name email avatar')
    .populate('column', 'name');

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({
    status: 'success',
    data: { task }
  });
});

// Update task
export const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;

  // Remove fields that shouldn't be updated directly
  delete updates._id;
  delete updates.createdBy;
  delete updates.project;
  delete updates.board;

  const task = await Task.findByIdAndUpdate(
    taskId,
    updates,
    { new: true, runValidators: true }
  )
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.user', 'name email avatar');

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({
    status: 'success',
    message: 'Task updated successfully',
    data: { task }
  });
});

// Delete task
export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Remove task from column
  await Column.findByIdAndUpdate(task.column, {
    $pull: { taskIds: taskId }
  });

  // Delete task
  await Task.findByIdAndDelete(taskId);

  res.json({
    status: 'success',
    message: 'Task deleted successfully'
  });
});

// Add comment to task
export const addComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  task.comments.push({
    user: req.user._id,
    text
  });

  await task.save();

  const updatedTask = await Task.findById(taskId)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.user', 'name email avatar');

  res.status(201).json({
    status: 'success',
    message: 'Comment added successfully',
    data: { task: updatedTask }
  });
});

// Delete comment
export const deleteComment = asyncHandler(async (req, res) => {
  const { taskId, commentId } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const comment = task.comments.id(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  // Check if user is comment author or admin
  const isAuthor = comment.user.toString() === userId.toString();
  const isAdmin = req.userProjectRole === 'admin';

  if (!isAuthor && !isAdmin) {
    throw new AppError('Not authorized to delete this comment', 403);
  }

  task.comments.pull(commentId);
  await task.save();

  res.json({
    status: 'success',
    message: 'Comment deleted successfully'
  });
});

// Get tasks assigned to current user
export const getMyTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, priority } = req.query;

  const filter = { assignee: userId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const tasks = await Task.find(filter)
    .populate('project', 'name')
    .populate('board', 'name')
    .populate('column', 'name')
    .populate('createdBy', 'name email avatar')
    .sort({ dueDate: 1 });

  res.json({
    status: 'success',
    data: { tasks }
  });
});

// Get dashboard stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get user's projects
  const projects = await Project.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    isActive: true
  });

  const projectIds = projects.map(p => p._id);

  // Task stats
  const taskStats = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Priority stats
  const priorityStats = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Upcoming deadlines
  const upcomingTasks = await Task.find({
    project: { $in: projectIds },
    dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    status: { $ne: 'done' }
  })
    .populate('project', 'name')
    .sort({ dueDate: 1 })
    .limit(10);

  res.json({
    status: 'success',
    data: {
      projectCount: projects.length,
      taskStats: taskStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      priorityStats: priorityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      upcomingTasks
    }
  });
});

// Helper function
function getStatusFromColumnName(columnName) {
  const name = columnName.toLowerCase();
  if (name.includes('done') || name.includes('complete')) return 'done';
  if (name.includes('progress') || name.includes('doing')) return 'in-progress';
  return 'todo';
}
