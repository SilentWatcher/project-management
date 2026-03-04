import Project from '../models/Project.js';
import User from '../models/User.js';
import Board from '../models/Board.js';
import Column from '../models/Column.js';
import Task from '../models/Task.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { PERMISSIONS } from '../middleware/authorization.js';

// Create new project
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, priority, status, startDate, endDate, workspace } = req.body;
  const userId = req.user._id;

  // Create project with current user as owner
  const project = await Project.create({
    name,
    description,
    priority: priority || 'medium',
    status: status || 'active',
    startDate,
    endDate,
    workspace,
    owner: userId,
    members: [{ user: userId, role: 'admin' }]
  });

  // Create default board with columns
  const board = await Board.create({
    name: 'Main Board',
    description: 'Default project board',
    project: project._id,
    isDefault: true
  });

  // Create default columns
  const defaultColumns = ['Todo', 'In Progress', 'Done'];
  await Promise.all(
    defaultColumns.map((name, index) =>
      Column.create({
        name,
        board: board._id,
        project: project._id,
        order: index,
        taskIds: []
      })
    )
  );

  const populatedProject = await Project.findById(project._id)
    .populate('workspace', 'name')
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.status(201).json({
    status: 'success',
    message: 'Project created successfully',
    data: { project: populatedProject }
  });
});

// Get all projects for current user with filtering and search
export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, priority, search } = req.query;

  // Build query
  const query = {
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    isActive: true
  };

  // Add status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Add priority filter
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  // Add search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    
    // Also include the user membership condition
    query.$or.push({ owner: userId });
    query.$or.push({ 'members.user': userId });
  }

  const projects = await Project.find(query)
    .populate('workspace', 'name')
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 });

  res.json({
    status: 'success',
    data: { projects }
  });
});

// Get single project
export const getProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId)
    .populate('workspace', 'name')
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Get project boards
  const boards = await Board.find({ project: projectId }).sort({ createdAt: 1 });

  // Get task counts
  const taskStats = await Task.aggregate([
    { $match: { project: project._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0
  };

  taskStats.forEach(stat => {
    stats[stat._id.replace('-', '')] = stat.count;
    stats.total += stat.count;
  });

  res.json({
    status: 'success',
    data: {
      project,
      boards,
      stats
    }
  });
});

// Update project
export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description, priority, status, startDate, endDate, workspace } = req.body;

  const project = await Project.findByIdAndUpdate(
    projectId,
    { name, description, priority, status, startDate, endDate, workspace },
    { new: true, runValidators: true }
  )
    .populate('workspace', 'name')
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  res.json({
    status: 'success',
    message: 'Project updated successfully',
    data: { project }
  });
});

// Delete project with cascade delete confirmation
export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { confirmCascade = false } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Count related tasks and boards
  const taskCount = await Task.countDocuments({ project: projectId });
  const boardCount = await Board.countDocuments({ project: projectId });
  
  // If not confirmed, return what will be deleted
  if (!confirmCascade) {
    return res.json({
      status: 'confirmation_required',
      data: {
        project,
        taskCount,
        boardCount,
        message: `Deleting this project will also delete ${boardCount} board(s) and ${taskCount} task(s). Are you sure?`
      }
    });
  }

  // Perform cascade delete
  const session = await Project.startSession();
  session.startTransaction();
  
  try {
    // Delete all tasks
    await Task.deleteMany({ project: projectId }, { session });
    
    // Delete all columns
    const columns = await Column.find({ project: projectId }, {}, { session });
    await Column.deleteMany({ project: projectId }, { session });
    
    // Delete all boards
    await Board.deleteMany({ project: projectId }, { session });
    
    // Soft delete the project
    project.isActive = false;
    await project.save({ session });
    
    await session.commitTransaction();
    
    res.json({
      status: 'success',
      message: `Project deleted successfully along with ${boardCount} board(s) and ${taskCount} task(s)`
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Add member to project
export const addMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { email, role = 'member' } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found with this email', 404);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if already a member
  if (project.isMember(user._id)) {
    throw new AppError('User is already a member of this project', 400);
  }

  // Add member
  project.members.push({ user: user._id, role });
  await project.save();

  const updatedProject = await Project.findById(projectId)
    .populate('workspace', 'name')
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.json({
    status: 'success',
    message: 'Member added successfully',
    data: { project: updatedProject }
  });
});

// Remove member from project
export const removeMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Cannot remove owner
  if (project.owner.toString() === userId) {
    throw new AppError('Cannot remove project owner', 400);
  }

  // Remove member
  project.members = project.members.filter(
    member => member.user.toString() !== userId
  );
  await project.save();

  const updatedProject = await Project.findById(projectId)
    .populate('workspace', 'name')
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.json({
    status: 'success',
    message: 'Member removed successfully',
    data: { project: updatedProject }
  });
});

// Update member role
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Cannot change owner role
  if (project.owner.toString() === userId) {
    throw new AppError('Cannot change project owner role', 400);
  }

  // Update member role
  const member = project.members.find(
    m => m.user.toString() === userId
  );

  if (!member) {
    throw new AppError('User is not a member of this project', 404);
  }

  member.role = role;
  await project.save();

  const updatedProject = await Project.findById(projectId)
    .populate('workspace', 'name')
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.json({
    status: 'success',
    message: 'Member role updated successfully',
    data: { project: updatedProject }
  });
});
