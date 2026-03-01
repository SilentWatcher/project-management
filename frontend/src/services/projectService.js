import api from './api';

export const projectService = {
  getProjects: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/projects?${queryString}` : '/projects';
    
    const response = await api.get(url);
    return response.data;
  },

  getProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId, confirmCascade = false) => {
    const response = await api.delete(`/projects/${projectId}`, {
      data: { confirmCascade }
    });
    return response.data;
  },

  addMember: async (projectId, memberData) => {
    const response = await api.post(`/projects/${projectId}/members`, memberData);
    return response.data;
  },

  removeMember: async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  updateMemberRole: async (projectId, userId, role) => {
    const response = await api.put(`/projects/${projectId}/members/${userId}/role`, { role });
    return response.data;
  },
};
