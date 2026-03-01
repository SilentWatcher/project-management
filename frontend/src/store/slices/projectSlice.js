import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import api from '../../services/api';

// Create entity adapter for normalized state
const projectsAdapter = createEntityAdapter({
  selectId: (project) => project._id,
  sortComparer: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
});

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (filters = {}, { rejectWithValue }) => {
    try {
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
      return response.data.data.projects;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data.data.project;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}`, updates);
      return response.data.data.project;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async ({ projectId, confirmCascade = false }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/projects/${projectId}`, {
        data: { confirmCascade }
      });
      
      // If confirmation is required, return the confirmation data
      if (response.data.status === 'confirmation_required') {
        return rejectWithValue({
          status: 'confirmation_required',
          data: response.data.data
        });
      }
      
      // If successful deletion
      return projectId;
    } catch (error) {
      // Handle confirmation_required response in error
      if (error.response?.data?.status === 'confirmation_required') {
        return rejectWithValue({
          status: 'confirmation_required',
          data: error.response.data.data
        });
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

const initialState = projectsAdapter.getInitialState({
  loading: false,
  error: null,
  currentProject: null,
});

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
    addProjectMember: (state, action) => {
      const { projectId, member } = action.payload;
      const project = state.entities[projectId];
      if (project) {
        project.members.push(member);
      }
    },
    removeProjectMember: (state, action) => {
      const { projectId, userId } = action.payload;
      const project = state.entities[projectId];
      if (project) {
        project.members = project.members.filter((m) => m.user._id !== userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        projectsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        projectsAdapter.addOne(state, action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        projectsAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })
      // Delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        projectsAdapter.removeOne(state, action.payload);
      });
  },
});

export const {
  setCurrentProject,
  clearProjectError,
  addProjectMember,
  removeProjectMember,
} = projectSlice.actions;

// Export entity adapter selectors
export const {
  selectAll: selectAllProjects,
  selectById: selectProjectById,
  selectIds: selectProjectIds,
} = projectsAdapter.getSelectors((state) => state.projects);

export const selectProjectsLoading = (state) => state.projects.loading;
export const selectProjectsError = (state) => state.projects.error;
export const selectCurrentProject = (state) => state.projects.currentProject;

export default projectSlice.reducer;
