import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import uiReducer from './slices/uiSlice';
import workspaceReducer from './slices/workspaceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    ui: uiReducer,
    workspaces: workspaceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ui/setTheme', 'ui/setAccentColor'],
      },
    }),
});

export default store;
