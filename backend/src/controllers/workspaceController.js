import Workspace from '../models/Workspace.js';
import Project from '../models/Project.js';

// Get all workspaces for a user
export const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get workspaces where user is owner or member
    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ],
      isActive: true
    }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');
    
    res.status(200).json({
      status: 'success',
      data: { workspaces }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create a new workspace
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user._id;
    
    const workspace = await Workspace.create({
      name,
      description,
      owner: userId,
      members: []
    });
    
    await workspace.populate('owner', 'name email avatar');
    
    res.status(201).json({
      status: 'success',
      data: { workspace }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single workspace by ID
export const getWorkspaceById = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;
    
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ],
      isActive: true
    }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');
    
    if (!workspace) {
      return res.status(404).json({
        status: 'error',
        message: 'Workspace not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { workspace }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a workspace
export const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;
    
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: userId,
      isActive: true
    });
    
    if (!workspace) {
      return res.status(404).json({
        status: 'error',
        message: 'Workspace not found or you do not have permission to update it'
      });
    }
    
    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    
    await workspace.save();
    await workspace.populate('owner', 'name email avatar');
    await workspace.populate('members.user', 'name email avatar');
    
    res.status(200).json({
      status: 'success',
      data: { workspace }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a workspace
export const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;
    
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: userId,
      isActive: true
    });
    
    if (!workspace) {
      return res.status(404).json({
        status: 'error',
        message: 'Workspace not found or you do not have permission to delete it'
      });
    }
    
    // Soft delete - set isActive to false
    workspace.isActive = false;
    await workspace.save();
    
    // Also deactivate all projects in the workspace
    await Project.updateMany(
      { workspace: workspaceId },
      { isActive: false }
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add member to workspace
export const addWorkspaceMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { userId, role = 'member' } = req.body;
    const currentUserId = req.user._id;
    
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: currentUserId,
      isActive: true
    });
    
    if (!workspace) {
      return res.status(404).json({
        status: 'error',
        message: 'Workspace not found or you do not have permission to add members'
      });
    }
    
    // Check if user is already a member
    const existingMember = workspace.members.find(
      m => m.user.toString() === userId
    );
    
    if (existingMember) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already a member of this workspace'
      });
    }
    
    workspace.members.push({ user: userId, role });
    await workspace.save();
    await workspace.populate('owner', 'name email avatar');
    await workspace.populate('members.user', 'name email avatar');
    
    res.status(200).json({
      status: 'success',
      data: { workspace }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Remove member from workspace
export const removeWorkspaceMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const currentUserId = req.user._id;
    
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: currentUserId,
      isActive: true
    });
    
    if (!workspace) {
      return res.status(404).json({
        status: 'error',
        message: 'Workspace not found or you do not have permission to remove members'
      });
    }
    
    workspace.members = workspace.members.filter(
      m => m.user.toString() !== memberId
    );
    
    await workspace.save();
    await workspace.populate('owner', 'name email avatar');
    await workspace.populate('members.user', 'name email avatar');
    
    res.status(200).json({
      status: 'success',
      data: { workspace }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get workspace with projects
export const getWorkspaceWithProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;
    
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ],
      isActive: true
    }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');
    
    if (!workspace) {
      return res.status(404).json({
        status: 'error',
        message: 'Workspace not found'
      });
    }
    
    // Get all projects in the workspace
    const projects = await Project.find({
      workspace: workspaceId,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ],
      isActive: true
    }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');
    
    res.status(200).json({
      status: 'success',
      data: { workspace, projects }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
