import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Typography,
  Button,
  Tabs,
  Row,
  Col,
  Statistic,
  Avatar,
  List,
  Tag,
  Space,
  Empty,
  Spin,
  Dropdown,
  Menu,
  Modal,
  Input,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  ProjectOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { projectService } from '../services/projectService';
import { boardService } from '../services/boardService';
import { selectAccentPreset } from '../store/slices/uiSlice';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
const { confirm } = Modal;

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accent = useSelector(selectAccentPreset);
  
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('boards');

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProject(projectId);
      setProject(response.data.project);
      setBoards(response.data.boards);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    Modal.confirm({
      title: 'Create New Board',
      content: (
        <Input
          placeholder="Enter board name"
          id="boardName"
        />
      ),
      onOk: async () => {
        const name = document.getElementById('boardName').value;
        if (!name) return;
        try {
          await boardService.createBoard(projectId, { name });
          toast.success('Board created successfully');
          loadProjectData();
        } catch (error) {
          toast.error('Failed to create board');
        }
      },
    });
  };

  const handleDeleteProject = async () => {
    try {
      // First attempt without confirmation
      await projectService.deleteProject(projectId);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      // Handle confirmation required
      if (error.response?.data?.status === 'confirmation_required') {
        const { message, taskCount, boardCount } = error.response.data.data;
        
        confirm({
          title: 'Confirm Project Deletion',
          icon: <ExclamationCircleOutlined />,
          content: (
            <div>
              <p>{message}</p>
              <p style={{ color: '#ff4d4f', fontWeight: 500 }}>
                This will permanently delete:
              </p>
              <ul>
                <li>{boardCount} board{boardCount !== 1 ? 's' : ''}</li>
                <li>{taskCount} task{taskCount !== 1 ? 's' : ''}</li>
              </ul>
              <p style={{ color: '#ff4d4f', fontWeight: 500, marginTop: 12 }}>
                This action cannot be undone.
              </p>
            </div>
          ),
          okText: 'Delete Project',
          okType: 'danger',
          cancelText: 'Cancel',
          onOk: async () => {
            try {
              await projectService.deleteProject(projectId, true); // confirmCascade = true
              toast.success('Project deleted successfully');
              navigate('/projects');
            } catch (confirmError) {
              toast.error('Failed to delete project');
            }
          },
        });
      } else {
        toast.error('Failed to delete project');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'blue';
      case 'on-hold':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'purple';
      case 'member':
        return 'blue';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <Empty description="Project not found" style={{ marginTop: 100 }} />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <Avatar
                size={56}
                style={{
                  background: accent.gradient,
                  fontSize: 24,
                  fontWeight: 'bold',
                }}
              >
                {project.name.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {project.name}
                </Title>
                <Space>
                  <Text type="secondary">{project.description || 'No description'}</Text>
                  <Tag color={getStatusColor(project.status)}>{project.status}</Tag>
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateBoard}
                style={{
                  background: accent.gradient,
                  border: 'none',
                }}
              >
                New Board
              </Button>
              <Dropdown
                menu={{
                  items: [
                    { key: 'edit', icon: <EditOutlined />, label: 'Edit Project' },
                    { type: 'divider' },
                    { key: 'delete', icon: <DeleteOutlined />, label: 'Delete Project', danger: true, onClick: handleDeleteProject },
                  ],
                }}
              >
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Stats */}
      {stats && (
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Tasks"
                value={stats.total}
                valueStyle={{ color: 'var(--text-primary)' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="To Do"
                value={stats.todo}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="In Progress"
                value={stats.inProgress}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Done"
                value={stats.done}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'boards',
            label: (
              <Space>
                <ProjectOutlined />
                Boards
              </Space>
            ),
            children: (
              <Row gutter={[24, 24]}>
                {boards.map((board) => (
                  <Col xs={24} sm={12} lg={8} key={board._id}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        hoverable
                        onClick={() => navigate(`/projects/${projectId}/boards/${board._id}`)}
                        style={{ borderRadius: 12 }}
                      >
                        <Card.Meta
                          avatar={
                            <Avatar
                              size={48}
                              style={{
                                background: accent.gradient,
                              }}
                              icon={<ProjectOutlined />}
                            />
                          }
                          title={
                            <Space>
                              {board.name}
                              {board.isDefault && <Tag size="small">Default</Tag>}
                            </Space>
                          }
                          description={
                            <Text type="secondary" ellipsis>
                              {board.description || 'No description'}
                            </Text>
                          }
                        />
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                          <Text type="secondary" style={{ color: accent.primary }}>
                            Open Board <ArrowRightOutlined />
                          </Text>
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
                <Col xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    onClick={handleCreateBoard}
                    style={{
                      borderRadius: 12,
                      borderStyle: 'dashed',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 150,
                    }}
                  >
                    <Space direction="vertical" align="center">
                      <PlusOutlined style={{ fontSize: 24, color: 'var(--text-tertiary)' }} />
                      <Text type="secondary">Create New Board</Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'members',
            label: (
              <Space>
                <TeamOutlined />
                Members ({project.members?.length || 0})
              </Space>
            ),
            children: (
              <Card
                title="Team Members"
                extra={
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add Member
                  </Button>
                }
                style={{ borderRadius: 12 }}
              >
                <List
                  dataSource={project.members}
                  renderItem={(member) => (
                    <List.Item
                      actions={[
                        <Tag color={getRoleColor(member.role)}>{member.role}</Tag>,
                        <Dropdown
                          menu={{
                            items: [
                              { key: 'edit', label: 'Edit Role' },
                              { key: 'remove', label: 'Remove', danger: true },
                            ],
                          }}
                        >
                          <Button type="text" icon={<MoreOutlined />} />
                        </Dropdown>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={member.user.avatar}
                            style={{ background: accent.gradient }}
                          >
                            {member.user.name.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        title={member.user.name}
                        description={member.user.email}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ),
          },
        ]}
      />
    </motion.div>
  );
};

export default ProjectDetail;
