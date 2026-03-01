import { Layout, Menu, Button, Avatar, Typography, Space, Divider } from 'antd';
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

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = ({ collapsed, mobile, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const accent = useSelector(selectAccentPreset);
  const projects = useSelector(selectAllProjects);
  const user = useSelector((state) => state.auth.user);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'My Tasks',
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
    },
    {
      key: '/team',
      icon: <TeamOutlined />,
      label: 'Team',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (mobile && onClose) {
      onClose();
    }
  };

  const handleCreateProject = () => {
    dispatch(openModal({ modal: 'projectCreate' }));
    if (mobile && onClose) {
      onClose();
    }
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      style={{
        background: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-color)',
        position: mobile ? 'relative' : 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'auto',
      }}
      className="shadow-lg"
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 24px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <motion.div
          initial={false}
          animate={{ scale: collapsed ? 0.8 : 1 }}
          className="flex items-center gap-3"
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: accent.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ProjectOutlined style={{ color: 'white', fontSize: 20 }} />
          </div>
          {!collapsed && (
            <Text
              strong
              style={{
                fontSize: 18,
                background: accent.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TaskFlow
            </Text>
          )}
        </motion.div>
      </div>

      {/* Create Project Button */}
      <div style={{ padding: collapsed ? '16px 8px' : '16px 24px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block={!collapsed}
          onClick={handleCreateProject}
          style={{
            background: accent.gradient,
            border: 'none',
            borderRadius: 8,
            height: collapsed ? 40 : 44,
          }}
        >
          {!collapsed && 'New Project'}
        </Button>
      </div>

      {/* Main Navigation */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: 'transparent',
          borderRight: 'none',
        }}
        inlineCollapsed={collapsed}
      />

      {/* Recent Projects Section */}
      {!collapsed && projects.length > 0 && (
        <>
          <Divider style={{ margin: '16px 24px' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Recent Projects
            </Text>
          </Divider>
          <div style={{ padding: '0 16px' }}>
            {projects.slice(0, 5).map((project) => (
              <motion.div
                key={project._id}
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/projects/${project._id}`)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 4,
                }}
                className="hover:bg-opacity-10 hover:bg-gray-500"
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: accent.primary,
                  }}
                />
                <Text
                  ellipsis
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: location.pathname === `/projects/${project._id}`
                      ? accent.primary
                      : 'var(--text-secondary)',
                  }}
                >
                  {project.name}
                </Text>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Bottom Section */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: collapsed ? '16px 8px' : '16px 24px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
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
                color: 'var(--text-secondary)',
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
              gap: 12,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <Avatar
              src={user?.avatar}
              style={{
                background: accent.gradient,
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <Text strong style={{ display: 'block' }}>
                  {user?.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                  {user?.email}
                </Text>
              </div>
            )}
          </div>
        </Space>
      </div>
    </Sider>
  );
};

export default Sidebar;
