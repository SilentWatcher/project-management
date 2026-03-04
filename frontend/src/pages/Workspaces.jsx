import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Avatar,
  Space,
  Empty,
  Spin,
  Dropdown,
  Modal,
  message,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FolderOutlined,
  TeamOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  fetchWorkspaces, 
  selectAllWorkspaces, 
  selectWorkspacesLoading,
  deleteWorkspace,
} from '../store/slices/workspaceSlice';
import { fetchProjects, selectAllProjects } from '../store/slices/projectSlice';
import { selectAccentPreset, openModal } from '../store/slices/uiSlice';
import CreateWorkspaceModal from '../components/modals/CreateWorkspaceModal';

const { Title, Text } = Typography;

const Workspaces = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accent = useSelector(selectAccentPreset);
  const workspaces = useSelector(selectAllWorkspaces);
  const projects = useSelector(selectAllProjects);
  const loading = useSelector(selectWorkspacesLoading);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  useEffect(() => {
    dispatch(fetchWorkspaces());
    dispatch(fetchProjects());
  }, [dispatch]);

  // Get projects for a specific workspace
  const getWorkspaceProjects = (workspaceId) => {
    return projects.filter(p => p.workspace === workspaceId);
  };

  // Handle workspace click - navigate to projects page with workspace filter
  const handleWorkspaceClick = (workspace) => {
    navigate(`/projects?workspace=${workspace._id}`);
  };

  // Handle delete workspace
  const handleDeleteWorkspace = async (workspace) => {
    try {
      await dispatch(deleteWorkspace(workspace._id)).unwrap();
      message.success('Workspace deleted successfully');
    } catch (error) {
      message.error(error || 'Failed to delete workspace');
    }
  };

  // Menu items for workspace actions
  const getMenuItems = (workspace) => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'View Projects',
        onClick: () => handleWorkspaceClick(workspace),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDeleteWorkspace(workspace),
      },
    ],
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Workspaces</Title>
            <Text type="secondary">Organize your projects into workspaces</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setShowCreateModal(true)}
            style={{
              background: accent.gradient,
              border: 'none',
              borderRadius: 8,
            }}
          >
            New Workspace
          </Button>
        </div>
      </motion.div>

      {workspaces.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No workspaces yet. Create your first workspace to organize your projects."
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
              style={{
                background: accent.gradient,
                border: 'none',
              }}
            >
              Create Workspace
            </Button>
          </Empty>
        </motion.div>
      ) : (
        <Row gutter={[24, 24]}>
          {workspaces.map((workspace) => {
            const workspaceProjects = getWorkspaceProjects(workspace._id);
            return (
              <Col xs={24} sm={12} lg={8} key={workspace._id}>
                <motion.div variants={itemVariants}>
                  <Card
                    hoverable
                    onClick={() => handleWorkspaceClick(workspace)}
                    style={{ 
                      borderRadius: 16,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Workspace Header with Gradient */}
                    <div
                      style={{
                        height: 100,
                        background: accent.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <FolderOutlined style={{ fontSize: 48, color: 'white', opacity: 0.8 }} />
                      
                      {/* Action Menu */}
                      <Dropdown 
                        menu={getMenuItems(workspace)} 
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'white',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                    </div>

                    {/* Workspace Info */}
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                        <Avatar 
                          size={48} 
                          style={{ 
                            background: accent.gradient,
                            marginRight: 12,
                          }}
                        >
                          {workspace.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <Text strong style={{ fontSize: 16, display: 'block' }} ellipsis>
                            {workspace.name}
                          </Text>
                          <Text type="secondary" ellipsis>
                            {workspace.description || 'No description'}
                          </Text>
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderTop: '1px solid var(--border-color)',
                      }}>
                        <Space>
                          <ProjectOutlined />
                          <Text>{workspaceProjects.length} Projects</Text>
                        </Space>
                        <Space>
                          <TeamOutlined />
                          <Text>{workspace.members?.length + 1 || 1} Members</Text>
                        </Space>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
      />
    </motion.div>
  );
};

export default Workspaces;
