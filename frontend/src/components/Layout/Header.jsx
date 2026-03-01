import { Layout, Button, Badge, Dropdown, Space, Typography, Tooltip } from 'antd';
import {
  MenuOutlined,
  BellOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  toggleTheme,
  selectTheme,
  selectAccentPreset,
  ACCENT_PRESETS,
  setAccentColor,
} from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useSelector(selectTheme);
  const accent = useSelector(selectAccentPreset);
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const accentMenuItems = Object.entries(ACCENT_PRESETS).map(([key, preset]) => ({
    key,
    label: (
      <Space>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            background: preset.gradient,
          }}
        />
        <Text>{preset.name}</Text>
      </Space>
    ),
    onClick: () => dispatch(setAccentColor(key)),
  }));

  return (
    <AntHeader
      style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
      }}
    >
      {/* Left Section */}
      <Space>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          className="lg:hidden"
          style={{ color: 'var(--text-primary)' }}
        />
        <Text
          strong
          style={{
            fontSize: 18,
            display: 'none',
            lg: { display: 'block' },
          }}
          className="hidden lg:block"
        >
          Welcome back, {user?.name?.split(' ')[0]}
        </Text>
      </Space>

      {/* Right Section */}
      <Space size="middle">
        {/* Accent Color Picker */}
        <Dropdown
          menu={{ items: accentMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Tooltip title="Change accent color">
            <Button
              type="text"
              icon={
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: accent.gradient,
                  }}
                />
              }
              style={{ padding: 4 }}
            />
          </Tooltip>
        </Dropdown>

        {/* Theme Toggle */}
        <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => dispatch(toggleTheme())}
              style={{
                color: isDark ? '#faad14' : '#722ed1',
                fontSize: 18,
              }}
            />
          </motion.div>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <Badge count={5} size="small" offset={[-2, 2]}>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: 'var(--text-primary)', fontSize: 18 }}
            />
          </Badge>
        </Tooltip>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Button
            type="text"
            style={{
              height: 40,
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: accent.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <Text strong className="hidden sm:block">
              {user?.name?.split(' ')[0]}
            </Text>
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
