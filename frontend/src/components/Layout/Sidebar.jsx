import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Input, Dropdown, Badge, Tooltip } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  TeamOutlined,
  BarChartOutlined,
  SearchOutlined,
  BellOutlined,
  HomeOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  DownOutlined,
  MessageOutlined,
  MoreOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  toggleSidebar,
  selectSidebarCollapsed,
  selectAccentPreset,
  openModal,
} from '../../store/slices/uiSlice';
import { selectAllProjects } from '../../store/slices/projectSlice';
import { selectUser } from '../../store/slices/authSlice';
import { 
  selectAllWorkspaces, 
  fetchWorkspaces,
} from '../../store/slices/workspaceSlice';

const { Text, Title } = Typography;
const { Sider } = Layout;

const Sidebar = ({ collapsed, mobile, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const accent = useSelector(selectAccentPreset);
  const projects = useSelector(selectAllProjects);
  const workspaces = useSelector(selectAllWorkspaces);
  const user = useSelector((state) => state.auth.user);
  
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace]);

  // Slack-inspired navigation items
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'divider1',
      type: 'divider',
    },
    {
      key: 'channels',
      label: 'Channels',
      icon: <AppstoreOutlined style={{ fontSize: 18 }} />,
      children: [
        {
          key: '/projects',
          icon: <ProjectOutlined />,
          label: 'All Projects',
        },
      ],
    },
    {
      key: 'direct',
      label: 'Direct Messages',
      icon: <MessageOutlined style={{ fontSize: 18 }} />,
      children: [
        {
          key: '/tasks',
          icon: <CheckSquareOutlined />,
          label: 'My Tasks',
        },
        {
          key: '/team',
          icon: <TeamOutlined />,
          label: 'Team',
        },
      ],
    },
    {
      key: 'divider2',
      type: 'divider',
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
      if (mobile && onClose) {
        onClose();
      }
    }
  };

  const handleCreateProject = () => {
    dispatch(openModal({ modal: 'projectCreate' }));
    if (mobile && onClose) {
      onClose();
    }
  };

  // User menu items
  const userMenuItems = {
    items: [
      {
        key: 'profile',
        label: 'Profile',
      },
      {
        key: 'settings',
        label: 'Settings',
        onClick: () => navigate('/settings'),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: 'Log out',
        danger: true,
      },
    ],
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      collapsedWidth={60}
      style={{
        background: '#1a1d21', // Slack dark background
        borderRight: '1px solid #2c3038',
        position: mobile ? 'relative' : 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Workspace Header */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? 0 : '0 12px',
          borderBottom: '1px solid #2c3038',
          cursor: 'pointer',
          background: '#1264a3', // Slack blue
        }}
        onClick={() => navigate('/workspaces')}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1264a3',
                fontWeight: 'bold',
                fontSize: 14,
              }}
            >
              {currentWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
            </div>
            <Text strong style={{ color: 'white', fontSize: 15 }}>
              {currentWorkspace?.name || 'TaskFlow'}
            </Text>
          </div>
        )}
        {!collapsed && (
          <DownOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />
        )}
        {collapsed && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1264a3',
              fontWeight: 'bold',
              fontSize: 14,
            }}
          >
            {currentWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{ padding: '10px 12px' }}>
          <Input
            placeholder="Search"
            prefix={<SearchOutlined style={{ color: '#616061' }} />}
            style={{
              background: '#222529',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              fontSize: 13,
            }}
          />
        </div>
      )}

      {/* Navigation Menu */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 'none',
            color: '#ababad',
          }}
          inlineCollapsed={collapsed}
          subMenuOpenDelay={0.1}
          subMenuCloseDelay={0.1}
        />
        
        {/* Projects Section */}
        {!collapsed && projects.length > 0 && (
          <>
            <div style={{ padding: '16px 12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#ababad', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                Projects
              </Text>
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined style={{ color: '#ababad', fontSize: 12 }} />}
                onClick={handleCreateProject}
                style={{ color: '#ababad', padding: '0 4px' }}
              />
            </div>
            <Menu
              mode="inline"
              selectable={false}
              style={{
                background: 'transparent',
                borderRight: 'none',
                color: '#ababad',
              }}
            >
              {projects.slice(0, 8).map((project) => (
                <Menu.Item
                  key={project._id}
                  icon={<AppstoreOutlined />}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  style={{
                    paddingLeft: collapsed ? 0 : 16,
                    color: location.pathname === `/projects/${project._id}` ? 'white' : '#ababad',
                  }}
                >
                  <Text ellipsis style={{ color: 'inherit', fontSize: 14 }}>
                    {project.name}
                  </Text>
                </Menu.Item>
              ))}
            </Menu>
          </>
        )}
      </div>

      {/* Bottom Actions */}
      <div
        style={{
          padding: collapsed ? '8px 0' : '8px 12px',
          borderTop: '1px solid #2c3038',
          background: '#1a1d21',
        }}
      >
        {/* Collapse Toggle */}
        {!mobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => dispatch(toggleSidebar())}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: '#ababad',
              marginBottom: 8,
            }}
          >
            {!collapsed && 'Collapse'}
          </Button>
        )}

        {/* User Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '4px 8px',
            borderRadius: 6,
            cursor: 'pointer',
            background: '#222529',
          }}
        >
          <Avatar
            src={user?.avatar}
            size={collapsed ? 28 : 32}
            style={{
              background: accent.gradient,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          {!collapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Text strong style={{ display: 'block', color: 'white', fontSize: 13 }}>
                {user?.name}
              </Text>
              <Text style={{ color: '#ababad', fontSize: 11 }}>
                {user?.status || 'Online'}
              </Text>
            </div>
          )}
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
