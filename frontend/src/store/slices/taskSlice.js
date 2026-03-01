import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import api from '../../services/api';

// Create entity adapter for normalized state
const tasksAdapter = createEntityAdapter({
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
});

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/board/${boardId}`);
      return response.data.data.tasks;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks/my-tasks');
      return response.data.data.tasks;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ boardId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/board/${boardId}`, taskData);
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async (moveData, { rejectWithValue }) => {
    try {
      await api.post('/columns/move-task', moveData);
      return moveData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move task');
    }
  }
);

const initialState = tasksAdapter.getInitialState({
  loading: false,
  error: null,
  currentTask: null,
  columns: [],
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
    setColumns: (state, action) => {
      state.columns = action.payload;
    },
    updateTaskColumn: (state, action) => {
      const { taskId, columnId, status } = action.payload;
      const task = state.entities[taskId];
      if (task) {
        task.column = columnId;
        if (status) task.status = status;
      }
    },
    reorderTasks: (state, action) => {
      const { columnId, taskIds } = action.payload;
      const column = state.columns.find((c) => c._id === columnId);
      if (column) {
        column.taskIds = taskIds;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        tasksAdapter.setAll(state, action.payload);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my tasks
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        tasksAdapter.setAll(state, action.payload);
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        tasksAdapter.addOne(state, action.payload);
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        tasksAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        tasksAdapter.removeOne(state, action.payload);
      });
  },
});

export const {
  setCurrentTask,
  clearTaskError,
  setColumns,
  updateTaskColumn,
  reorderTasks,
} = taskSlice.actions;

// Export entity adapter selectors
export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds,
} = tasksAdapter.getSelectors((state) => state.tasks);

export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectColumns = (state) => state.tasks.columns;

export default taskSlice.reducer;
