import Board from '../models/Board.js';
import Column from '../models/Column.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

// Create new board
export const createBoard = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  const board = await Board.create({
    name,
    description,
    project: projectId
  });

  // Create default columns
  const defaultColumns = ['Todo', 'In Progress', 'Done'];
  const columns = await Promise.all(
    defaultColumns.map((colName, index) =>
      Column.create({
        name: colName,
        board: board._id,
        project: projectId,
        order: index,
        taskIds: []
      })
    )
  );

  res.status(201).json({
    status: 'success',
    message: 'Board created successfully',
    data: { board, columns }
  });
});

// Get all boards for a project
export const getBoards = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const boards = await Board.find({ project: projectId })
    .sort({ isDefault: -1, createdAt: 1 });

  res.json({
    status: 'success',
    data: { boards }
  });
});

// Get single board with columns and tasks
export const getBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  const board = await Board.findById(boardId);
  if (!board) {
    throw new AppError('Board not found', 404);
  }

  // Get columns with task IDs
  const columns = await Column.find({ board: boardId })
    .sort({ order: 1 });

  // Get all task IDs from all columns
  const allTaskIds = columns.reduce((acc, col) => {
    return [...acc, ...col.taskIds];
  }, []);

  // Fetch all tasks
  const tasks = await Task.find({ _id: { $in: allTaskIds } })
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.user', 'name email avatar');

  // Create a map for quick lookup
  const taskMap = new Map(tasks.map(t => [t._id.toString(), t]));

  // Build response with tasks populated in columns
  const columnsWithTasks = columns.map(col => ({
    ...col.toObject(),
    tasks: col.taskIds.map(taskId => taskMap.get(taskId.toString())).filter(Boolean)
  }));

  res.json({
    status: 'success',
    data: {
      board,
      columns: columnsWithTasks
    }
  });
});

// Update board
export const updateBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { name, description } = req.body;

  const board = await Board.findByIdAndUpdate(
    boardId,
    { name, description },
    { new: true, runValidators: true }
  );

  if (!board) {
    throw new AppError('Board not found', 404);
  }

  res.json({
    status: 'success',
    message: 'Board updated successfully',
    data: { board }
  });
});

// Delete board
export const deleteBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  const board = await Board.findById(boardId);
  if (!board) {
    throw new AppError('Board not found', 404);
  }

  // Check if it's the only board
  const boardCount = await Board.countDocuments({ project: board.project });
  if (boardCount <= 1) {
    throw new AppError('Cannot delete the only board in a project', 400);
  }

  // Delete all columns and tasks in this board
  await Column.deleteMany({ board: boardId });
  await Task.deleteMany({ board: boardId });

  // Delete the board
  await Board.findByIdAndDelete(boardId);

  res.json({
    status: 'success',
    message: 'Board deleted successfully'
  });
});
