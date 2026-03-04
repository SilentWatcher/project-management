import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import * as workspaceService from '../../services/workspaceService';

// Create entity adapter for normalized state
const workspacesAdapter = createEntityAdapter({
  selectId: (workspace) => workspace._id,
  sortComparer: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
});

// Async thunks
export const fetchWorkspaces = createAsyncThunk(
  'workspaces/fetchWorkspaces',
  async (_, { rejectWithValue }) => {
    try {
      const workspaces = await workspaceService.getWorkspaces();
      return workspaces;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workspaces');
    }
  }
);

export const fetchWorkspaceWithProjects = createAsyncThunk(
  'workspaces/fetchWorkspaceWithProjects',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const data = await workspaceService.getWorkspaceWithProjects(workspaceId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workspace data');
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspaces/createWorkspace',
  async (workspaceData, { rejectWithValue }) => {
    try {
      const workspace = await workspaceService.createWorkspace(workspaceData);
      return workspace;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create workspace');
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspaces/updateWorkspace',
  async ({ workspaceId, updates }, { rejectWithValue }) => {
    try {
      const workspace = await workspaceService.updateWorkspace({ workspaceId, updates });
      return workspace;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update workspace');
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspaces/deleteWorkspace',
  async (workspaceId, { rejectWithValue }) => {
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      return workspaceId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete workspace');
    }
  }
);

const initialState = workspacesAdapter.getInitialState({
  loading: false,
  error: null,
  currentWorkspace: null,
  workspaceProjects: [],
});

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    clearWorkspaceError: (state) => {
      state.error = null;
    },
    clearWorkspaceProjects: (state) => {
      state.workspaceProjects = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch workspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        workspacesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch workspace with projects
      .addCase(fetchWorkspaceWithProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceWithProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload.workspace;
        state.workspaceProjects = action.payload.projects;
      })
      .addCase(fetchWorkspaceWithProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create workspace
      .addCase(createWorkspace.pending, (state) => {
        state.loading = true;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        workspacesAdapter.addOne(state, action.payload);
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update workspace
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        workspacesAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })
      // Delete workspace
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        workspacesAdapter.removeOne(state, action.payload);
      });
  },
});

export const {
  setCurrentWorkspace,
  clearWorkspaceError,
  clearWorkspaceProjects,
} = workspaceSlice.actions;

// Export entity adapter selectors
export const {
  selectAll: selectAllWorkspaces,
  selectById: selectWorkspaceById,
  selectIds: selectWorkspaceIds,
} = workspacesAdapter.getSelectors((state) => state.workspaces);

export const selectWorkspacesLoading = (state) => state.workspaces.loading;
export const selectWorkspacesError = (state) => state.workspaces.error;
export const selectCurrentWorkspace = (state) => state.workspaces.currentWorkspace;
export const selectWorkspaceProjects = (state) => state.workspaces.workspaceProjects;

export default workspaceSlice.reducer;
