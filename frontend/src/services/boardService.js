import api from './api';

export const boardService = {
  getBoards: async (projectId) => {
    const response = await api.get(`/boards/project/${projectId}`);
    return response.data;
  },

  getBoard: async (boardId) => {
    const response = await api.get(`/boards/${boardId}`);
    return response.data;
  },

  createBoard: async (projectId, boardData) => {
    const response = await api.post(`/boards/project/${projectId}`, boardData);
    return response.data;
  },

  updateBoard: async (boardId, boardData) => {
    const response = await api.put(`/boards/${boardId}`, boardData);
    return response.data;
  },

  deleteBoard: async (boardId) => {
    const response = await api.delete(`/boards/${boardId}`);
    return response.data;
  },
};

export const columnService = {
  getColumns: async (boardId) => {
    const response = await api.get(`/columns/board/${boardId}`);
    return response.data;
  },

  createColumn: async (boardId, columnData) => {
    const response = await api.post(`/columns/board/${boardId}`, columnData);
    return response.data;
  },

  updateColumn: async (columnId, columnData) => {
    const response = await api.put(`/columns/${columnId}`, columnData);
    return response.data;
  },

  deleteColumn: async (columnId) => {
    const response = await api.delete(`/columns/${columnId}`);
    return response.data;
  },

  moveTask: async (moveData) => {
    const response = await api.post('/columns/move-task', moveData);
    return response.data;
  },
};

export const taskService = {
  getTasks: async (boardId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/tasks/board/${boardId}?${params}`);
    return response.data;
  },

  getTask: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (boardId, taskData) => {
    const response = await api.post(`/tasks/board/${boardId}`, taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  addComment: async (taskId, text) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { text });
    return response.data;
  },

  deleteComment: async (taskId, commentId) => {
    const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/tasks/dashboard/stats');
    return response.data;
  },

  getMyTasks: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/tasks/my-tasks?${params}`);
    return response.data;
  },
};
