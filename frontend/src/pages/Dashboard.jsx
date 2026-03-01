import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Button,
  List,
  Avatar,
  Tag,
  Progress,
  Empty,
  Spin,
} from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, selectAllProjects, selectProjectsLoading } from '../store/slices/projectSlice';
import { fetchMyTasks, selectAllTasks, selectTasksLoading } from '../store/slices/taskSlice';
import { selectAccentPreset, openModal } from '../store/slices/uiSlice';
import { selectUser } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accent = useSelector(selectAccentPreset);
  const user = useSelector(selectUser);
  const projects = useSelector(selectAllProjects);
  const tasks = useSelector(selectAllTasks);
  const projectsLoading = useSelector(selectProjectsLoading);
  const tasksLoading = useSelector(selectTasksLoading);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchMyTasks());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Projects',
      value: projects.length,
      icon: <ProjectOutlined />,
      gradient: 'linear-gradient(135deg, #1890ff, #36cfc9)',
      link: '/projects',
    },
    {
      title: 'Active Tasks',
      value: tasks.filter((t) => t.status !== 'done').length,
      icon: <ClockCircleOutlined />,
      gradient: 'linear-gradient(135deg, #faad14, #ffc53d)',
      link: '/tasks',
    },
    {
      title: 'Completed',
      value: tasks.filter((t) => t.status === 'done').length,
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #52c41a, #95de64)',
      link: '/tasks',
    },
    {
      title: 'High Priority',
      value: tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length,
      icon: <WarningOutlined />,
      gradient: 'linear-gradient(135deg, #f5222d, #ff7875)',
      link: '/tasks',
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'success';
      case 'in-progress':
        return 'processing';
      case 'todo':
        return 'default';
      default:
        return 'default';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (projectsLoading || tasksLoading) {
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
      {/* Welcome Section */}
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </Title>
            <Text type="secondary">
              Here's what's happening with your projects today
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => dispatch(openModal({ modal: 'projectCreate' }))}
              style={{
                background: accent.gradient,
                border: 'none',
                borderRadius: 8,
              }}
            >
              New Project
            </Button>
          </Col>
        </Row>
      </motion.div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div variants={itemVariants}>
              <Card
                hoverable
                onClick={() => navigate(stat.link)}
                style={{
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                bodyStyle={{ padding: 24 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: stat.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      color: 'white',
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {stat.title}
                    </Text>
                    <Title level={3} style={{ margin: 0, marginTop: 4 }}>
                      {stat.value}
                    </Title>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Recent Projects */}
        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants}>
            <Card
              title="Recent Projects"
              extra={
                <Button
                  type="link"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/projects')}
                >
                  View All
                </Button>
              }
              style={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%',
              }}
            >
              {projects.length === 0 ? (
                <Empty description="No projects yet" />
              ) : (
                <List
                  dataSource={projects.slice(0, 5)}
                  renderItem={(project) => (
                    <List.Item
                      style={{ cursor: 'pointer', padding: '12px 0' }}
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              background: accent.gradient,
                            }}
                          >
                            {project.name.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        title={project.name}
                        description={
                          <Text type="secondary" ellipsis>
                            {project.description || 'No description'}
                          </Text>
                        }
                      />
                      <Tag color={project.status === 'active' ? 'success' : 'default'}>
                        {project.status}
                      </Tag>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </motion.div>
        </Col>

        {/* My Tasks */}
        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants}>
            <Card
              title="My Tasks"
              extra={
                <Button
                  type="link"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/tasks')}
                >
                  View All
                </Button>
              }
              style={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%',
              }}
            >
              {tasks.length === 0 ? (
                <Empty description="No tasks assigned to you" />
              ) : (
                <List
                  dataSource={tasks.slice(0, 5)}
                  renderItem={(task) => (
                    <List.Item style={{ padding: '12px 0' }}>
                      <List.Item.Meta
                        title={
                          <Space>
                            {task.title}
                            <Tag color={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space>
                            <Text type="secondary">{task.project?.name}</Text>
                            <Tag color={getStatusColor(task.status)}>
                              {task.status}
                            </Tag>
                          </Space>
                        }
                      />
                      {task.dueDate && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Text>
                      )}
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Dashboard;
