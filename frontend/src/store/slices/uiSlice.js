import { createSlice } from '@reduxjs/toolkit';

// Pre-defined gradient accent presets
export const ACCENT_PRESETS = {
  ocean: {
    name: 'Ocean Blue',
    primary: '#1890ff',
    secondary: '#722ed1',
    gradient: 'linear-gradient(135deg, #1890ff, #722ed1)',
  },
  sunset: {
    name: 'Sunset Orange',
    primary: '#fa8c16',
    secondary: '#f5222d',
    gradient: 'linear-gradient(135deg, #fa8c16, #f5222d)',
  },
  forest: {
    name: 'Forest Green',
    primary: '#52c41a',
    secondary: '#13c2c2',
    gradient: 'linear-gradient(135deg, #52c41a, #13c2c2)',
  },
  berry: {
    name: 'Berry Purple',
    primary: '#722ed1',
    secondary: '#eb2f96',
    gradient: 'linear-gradient(135deg, #722ed1, #eb2f96)',
  },
  golden: {
    name: 'Golden Hour',
    primary: '#faad14',
    secondary: '#fa541c',
    gradient: 'linear-gradient(135deg, #faad14, #fa541c)',
  },
  midnight: {
    name: 'Midnight',
    primary: '#2f54eb',
    secondary: '#13c2c2',
    gradient: 'linear-gradient(135deg, #2f54eb, #13c2c2)',
  },
};

// Load initial state from localStorage
const loadThemeFromStorage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : { isDark: false, accentColor: 'ocean' };
  }
  return { isDark: false, accentColor: 'ocean' };
};

const initialState = {
  isDark: false,
  accentColor: 'ocean',
  sidebarCollapsed: false,
  notifications: [],
  modals: {
    taskCreate: false,
    taskEdit: null,
    projectCreate: false,
  },
  ...loadThemeFromStorage(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', JSON.stringify({
          isDark: state.isDark,
          accentColor: state.accentColor,
        }));
      }
    },
    setTheme: (state, action) => {
      state.isDark = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', JSON.stringify({
          isDark: state.isDark,
          accentColor: state.accentColor,
        }));
      }
    },
    setAccentColor: (state, action) => {
      state.accentColor = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', JSON.stringify({
          isDark: state.isDark,
          accentColor: state.accentColor,
        }));
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    openModal: (state, action) => {
      const { modal, data } = action.payload;
      state.modals[modal] = data !== undefined ? data : true;
    },
    closeModal: (state, action) => {
      const { modal } = action.payload;
      state.modals[modal] = false;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  setAccentColor,
  toggleSidebar,
  setSidebarCollapsed,
  addNotification,
  removeNotification,
  openModal,
  closeModal,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state) => state.ui.isDark;
export const selectAccentColor = (state) => state.ui.accentColor;
export const selectAccentPreset = (state) => ACCENT_PRESETS[state.ui.accentColor];
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectModals = (state) => state.ui.modals;

export default uiSlice.reducer;
