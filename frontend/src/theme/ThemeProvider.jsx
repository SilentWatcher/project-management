import { useEffect, useMemo } from 'react';
import { ConfigProvider } from 'antd';
import { useSelector } from 'react-redux';
import { selectTheme, selectAccentColor } from '../store/slices/uiSlice';
import { getAntdTheme, getCustomCssVariables } from './antdTheme';

const ThemeProvider = ({ children }) => {
  const isDark = useSelector(selectTheme);
  const accentColor = useSelector(selectAccentColor);

  // Get Ant Design theme configuration
  const antdTheme = useMemo(() => {
    return getAntdTheme(isDark, accentColor);
  }, [isDark, accentColor]);

  // Apply custom CSS variables to document root
  useEffect(() => {
    const cssVariables = getCustomCssVariables(isDark, accentColor);
    const root = document.documentElement;
    
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply dark class to body for Tailwind dark mode (if still used)
    if (isDark) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = 'rgba(255, 255, 255, 0.85)';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f5f5f5';
      document.body.style.color = 'rgba(0, 0, 0, 0.88)';
    }

    return () => {
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [isDark, accentColor]);

  return (
    <ConfigProvider theme={antdTheme}>
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
