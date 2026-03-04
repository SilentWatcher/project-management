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

// Background presets
export const BACKGROUND_PRESETS = {
  none: {
    name: 'None',
    type: 'none',
  },
  gradient1: {
    name: 'Ocean Breeze',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  gradient2: {
    name: 'Sunset Glow',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  gradient3: {
    name: 'Forest Mist',
    type: 'gradient',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  gradient4: {
    name: 'Warm Flame',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  gradient5: {
    name: 'Night Fade',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
  gradient6: {
    name: 'Happy Fisher',
    type: 'gradient',
    value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  },
  pattern1: {
    name: 'Dots',
    type: 'pattern',
    value: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
    size: '20px',
  },
  pattern2: {
    name: 'Grid',
    type: 'pattern',
    value: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
    size: '20px',
  },
  pattern3: {
    name: 'Waves',
    type: 'pattern',
    value: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.1\'/%3E%3C/svg%3E")',
    size: '200px',
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

const loadBackgroundFromStorage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('background');
    return saved ? JSON.parse(saved) : { preset: 'none', opacity: 0.05 };
  }
  return { preset: 'none', opacity: 0.05 };
};

const initialState = {
  isDark: false,
  accentColor: 'ocean',
  sidebarCollapsed: false,
  background: loadBackgroundFromStorage(),
  notifications: [],
  modals: {
    taskCreate: false,
    taskEdit: null,
    projectCreate: false,
    workspaceCreate: false,
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
    setBackground: (state, action) => {
      state.background = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('background', JSON.stringify(state.background));
      }
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
  setBackground,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state) => state.ui.isDark;
export const selectAccentColor = (state) => state.ui.accentColor;
export const selectAccentPreset = (state) => ACCENT_PRESETS[state.ui.accentColor];
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectModals = (state) => state.ui.modals;
export const selectBackground = (state) => state.ui.background;
export const selectBackgroundPreset = (state) => BACKGROUND_PRESETS[state.ui.background.preset];

export default uiSlice.reducer;
