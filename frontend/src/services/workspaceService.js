import api from './api';

// Get all workspaces for current user
export const getWorkspaces = async () => {
  const response = await api.get('/workspaces');
  return response.data.data.workspaces;
};

// Get a single workspace by ID
export const getWorkspaceById = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}`);
  return response.data.data.workspace;
};

// Get workspace with projects
export const getWorkspaceWithProjects = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/projects`);
  return response.data.data;
};

// Create a new workspace
export const createWorkspace = async (workspaceData) => {
  const response = await api.post('/workspaces', workspaceData);
  return response.data.data.workspace;
};

// Update a workspace
export const updateWorkspace = async ({ workspaceId, updates }) => {
  const response = await api.put(`/workspaces/${workspaceId}`, updates);
  return response.data.data.workspace;
};

// Delete a workspace
export const deleteWorkspace = async (workspaceId) => {
  const response = await api.delete(`/workspaces/${workspaceId}`);
  return response.data;
};

// Add member to workspace
export const addWorkspaceMember = async ({ workspaceId, userId, role = 'member' }) => {
  const response = await api.post(`/workspaces/${workspaceId}/members`, { userId, role });
  return response.data.data.workspace;
};

// Remove member from workspace
export const removeWorkspaceMember = async ({ workspaceId, memberId }) => {
  const response = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  return response.data.data.workspace;
};
