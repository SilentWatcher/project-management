import Column from '../models/Column.js';
import Task from '../models/Task.js';
import Board from '../models/Board.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

// Create new column
export const createColumn = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { name } = req.body;

  // Get board to find project
  const board = await Board.findById(boardId);
  if (!board) {
    throw new AppError('Board not found', 404);
  }

  // Get max order
  const maxOrder = await Column.findOne({ board: boardId })
    .sort({ order: -1 })
    .select('order');

  const column = await Column.create({
    name,
    board: boardId,
    project: board.project,
    order: maxOrder ? maxOrder.order + 1 : 0,
    taskIds: []
  });

  res.status(201).json({
    status: 'success',
    message: 'Column created successfully',
    data: { column }
  });
});

// Get all columns for a board
export const getColumns = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  const columns = await Column.find({ board: boardId })
    .sort({ order: 1 });

  res.json({
    status: 'success',
    data: { columns }
  });
});

// Update column
export const updateColumn = asyncHandler(async (req, res) => {
  const { columnId } = req.params;
  const { name } = req.body;

  const column = await Column.findByIdAndUpdate(
    columnId,
    { name },
    { new: true, runValidators: true }
  );

  if (!column) {
    throw new AppError('Column not found', 404);
  }

  res.json({
    status: 'success',
    message: 'Column updated successfully',
    data: { column }
  });
});

// Delete column
export const deleteColumn = asyncHandler(async (req, res) => {
  const { columnId } = req.params;

  const column = await Column.findById(columnId);
  if (!column) {
    throw new AppError('Column not found', 404);
  }

  // Check if it's the only column
  const columnCount = await Column.countDocuments({ board: column.board });
  if (columnCount <= 1) {
    throw new AppError('Cannot delete the only column in a board', 400);
  }

  // Delete all tasks in this column
  await Task.deleteMany({ column: columnId });

  // Delete the column
  await Column.findByIdAndDelete(columnId);

  res.json({
    status: 'success',
    message: 'Column deleted successfully'
  });
});

// Reorder columns
export const reorderColumns = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { columnOrders } = req.body; // [{ columnId, order }]

  await Promise.all(
    columnOrders.map(({ columnId, order }) =>
      Column.findByIdAndUpdate(columnId, { order })
    )
  );

  const columns = await Column.find({ board: boardId }).sort({ order: 1 });

  res.json({
    status: 'success',
    message: 'Columns reordered successfully',
    data: { columns }
  });
});

// Move task between columns (drag and drop)
export const moveTask = asyncHandler(async (req, res) => {
  const {
    sourceColumnId,
    destinationColumnId,
    sourceIndex,
    destinationIndex,
    taskId
  } = req.body;

  // Get source and destination columns
  const [sourceColumn, destinationColumn] = await Promise.all([
    Column.findById(sourceColumnId),
    Column.findById(destinationColumnId)
  ]);

  if (!sourceColumn || !destinationColumn) {
    throw new AppError('Column not found', 404);
  }

  // Remove task from source column
  const sourceTaskIds = [...sourceColumn.taskIds];
  const taskIndex = sourceTaskIds.findIndex(
    id => id.toString() === taskId
  );

  if (taskIndex === -1) {
    throw new AppError('Task not found in source column', 404);
  }

  sourceTaskIds.splice(taskIndex, 1);

  // Add task to destination column
  const destTaskIds = sourceColumnId === destinationColumnId
    ? sourceTaskIds
    : [...destinationColumn.taskIds];

  destTaskIds.splice(destinationIndex, 0, taskId);

  // Update columns
  if (sourceColumnId === destinationColumnId) {
    await Column.findByIdAndUpdate(sourceColumnId, {
      taskIds: destTaskIds
    });
  } else {
    await Promise.all([
      Column.findByIdAndUpdate(sourceColumnId, { taskIds: sourceTaskIds }),
      Column.findByIdAndUpdate(destinationColumnId, { taskIds: destTaskIds })
    ]);

    // Update task's column reference
    await Task.findByIdAndUpdate(taskId, {
      column: destinationColumnId,
      status: getStatusFromColumnName(destinationColumn.name)
    });
  }

  res.json({
    status: 'success',
    message: 'Task moved successfully'
  });
});

// Helper function to map column name to status
function getStatusFromColumnName(columnName) {
  const name = columnName.toLowerCase();
  if (name.includes('done') || name.includes('complete')) return 'done';
  if (name.includes('progress') || name.includes('doing')) return 'in-progress';
  return 'todo';
}
