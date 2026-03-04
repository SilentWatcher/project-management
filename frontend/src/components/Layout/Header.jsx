import { useState } from 'react';
import { Layout, Input, Button, Avatar, Badge, Dropdown, Space, Typography, Tooltip } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  PlusOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { selectAccentPreset, openModal } from '../../store/slices/uiSlice';

const { Header } = Layout;
const { Text } = Typography;

const HeaderComponent = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const accent = useSelector(selectAccentPreset);

  // Get page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/projects/')) return 'Project';
    if (path === '/projects') return 'Projects';
    if (path === '/tasks') return 'My Tasks';
    if (path === '/calendar') return 'Calendar';
    if (path === '/team') return 'Team';
    if (path === '/analytics') return 'Analytics';
    if (path === '/settings') return 'Settings';
    if (path === '/workspaces') return 'Workspaces';
    return 'TaskFlow';
  };

  const handleCreate = () => {
    // Show dropdown for creating new items
    const items = [
      {
        key: 'project',
        icon: <AppstoreOutlined />,
        label: 'New Project',
        onClick: () => dispatch(openModal({ modal: 'projectCreate' })),
      },
      {
        key: 'task',
        icon: <PlusOutlined />,
        label: 'New Task',
      },
    ];
    return items;
  };

  // User menu
  const userMenuItems = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Settings',
        onClick: () => navigate('/settings'),
      },
      {
        key: 'help',
        icon: <QuestionCircleOutlined />,
        label: 'Help & Support',
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Sign out',
        danger: true,
      },
    ],
  };

  return (
    <Header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e8e8e8',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        position: 'sticky',
        top: 0,
        zIndex: 99,
      }}
    >
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          style={{ display: 'none' }}
          className="lg:flex"
        />
        
        {/* Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text strong style={{ fontSize: 18, color: '#1d1c1d' }}>
            {getPageTitle()}
          </Text>
        </div>
      </div>

      {/* Center Section - Search */}
      <div style={{ flex: 1, maxWidth: 500, margin: '0 24px' }}>
        <Input
          placeholder="Search TaskFlow..."
          prefix={<SearchOutlined style={{ color: '#ababad' }} />}
          style={{
            background: '#f8f8f8',
            border: 'none',
            borderRadius: 6,
            height: 36,
          }}
        />
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Create Button */}
        <Dropdown
          menu={{ items: handleCreate() }}
          trigger={['click']}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              background: '#1264a3',
              border: 'none',
              borderRadius: 6,
            }}
          >
            Create
          </Button>
        </Dropdown>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 18, color: '#616061' }} />}
            />
          </Badge>
        </Tooltip>

        {/* Messages */}
        <Tooltip title="Messages">
          <Button
            type="text"
            icon={<MessageOutlined style={{ fontSize: 18, color: '#616061' }} />}
          />
        </Tooltip>

        {/* Settings */}
        <Tooltip title="Settings">
          <Button
            type="text"
            icon={<SettingOutlined style={{ fontSize: 18, color: '#616061' }} />}
            onClick={() => navigate('/settings')}
          />
        </Tooltip>

        {/* User Profile */}
        <Dropdown menu={userMenuItems} trigger={['click']} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              marginLeft: 8,
            }}
          >
            <Avatar
              src={user?.avatar}
              size={32}
              style={{
                background: accent.gradient,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default HeaderComponent;
