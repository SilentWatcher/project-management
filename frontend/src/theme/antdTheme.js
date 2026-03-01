import { theme } from 'antd';
import { ACCENT_PRESETS } from '../store/slices/uiSlice';

const { defaultAlgorithm, darkAlgorithm } = theme;

export const getAntdTheme = (isDark, accentColorKey) => {
  const accent = ACCENT_PRESETS[accentColorKey] || ACCENT_PRESETS.ocean;
  
  return {
    token: {
      // Primary colors based on accent
      colorPrimary: accent.primary,
      colorInfo: accent.secondary,
      colorLink: accent.primary,
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      
      // Background colors
      colorBgContainer: isDark ? '#141414' : '#ffffff',
      colorBgLayout: isDark ? '#000000' : '#f5f5f5',
      colorBgElevated: isDark ? '#1f1f1f' : '#ffffff',
      colorBgSpotlight: isDark ? '#424242' : 'rgba(0, 0, 0, 0.85)',
      
      // Text colors
      colorText: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)',
      colorTextSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
      colorTextTertiary: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
      
      // Border colors
      colorBorder: isDark ? '#424242' : '#d9d9d9',
      colorBorderSecondary: isDark ? '#303030' : '#f0f0f0',
      
      // Border radius
      borderRadius: 8,
      borderRadiusLG: 12,
      borderRadiusSM: 4,
      
      // Font
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      
      // Shadow
      boxShadow: isDark 
        ? '0 6px 16px 0 rgba(0, 0, 0, 0.4), 0 3px 6px -4px rgba(0, 0, 0, 0.5), 0 9px 28px 8px rgba(0, 0, 0, 0.3)'
        : '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    },
    algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
    components: {
      Layout: {
        headerBg: isDark ? '#141414' : '#ffffff',
        siderBg: isDark ? '#141414' : '#ffffff',
        triggerBg: isDark ? '#1f1f1f' : '#ffffff',
        triggerColor: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
      },
      Menu: {
        darkItemBg: '#141414',
        darkItemSelectedBg: accent.primary + '20',
        darkItemSelectedColor: accent.primary,
        itemSelectedBg: accent.primary + '15',
        itemSelectedColor: accent.primary,
      },
      Card: {
        borderRadiusLG: 12,
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.4)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      Button: {
        borderRadiusLG: 8,
        primaryShadow: `0 2px 0 ${accent.primary}40`,
      },
      Input: {
        borderRadiusLG: 8,
      },
      Select: {
        borderRadiusLG: 8,
      },
      Modal: {
        borderRadiusLG: 12,
      },
      Tag: {
        borderRadiusSM: 4,
      },
      Badge: {
        statusProcessingSize: 8,
      },
    },
  };
};

export const getCustomCssVariables = (isDark, accentColorKey) => {
  const accent = ACCENT_PRESETS[accentColorKey] || ACCENT_PRESETS.ocean;
  
  return {
    '--primary-color': accent.primary,
    '--secondary-color': accent.secondary,
    '--gradient-primary': accent.gradient,
    '--bg-primary': isDark ? '#141414' : '#ffffff',
    '--bg-secondary': isDark ? '#1f1f1f' : '#f5f5f5',
    '--bg-tertiary': isDark ? '#2b2b2b' : '#fafafa',
    '--text-primary': isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)',
    '--text-secondary': isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
    '--text-tertiary': isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
    '--border-color': isDark ? '#424242' : '#d9d9d9',
    '--shadow-sm': isDark 
      ? '0 1px 2px 0 rgba(0, 0, 0, 0.4)'
      : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--shadow-md': isDark
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '--shadow-lg': isDark
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  };
};
