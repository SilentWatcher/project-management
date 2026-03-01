import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tag,
  Avatar,
  Space,
  Empty,
  Spin,
  Dropdown,
  Input,
  Select,
  Table,
  Switch,
  Popconfirm,
  Modal,
  message,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, selectAllProjects, selectProjectsLoading } from '../store/slices/projectSlice';
import { selectAccentPreset, openModal } from '../store/slices/uiSlice';
import CreateProjectModal from '../components/modals/CreateProjectModal';

const { Title, Text } = Typography;

const Projects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accent = useSelector(selectAccentPreset);
  const projects = useSelector(selectAllProjects);
  const loading = useSelector(selectProjectsLoading);
  
  // State for filters and view mode
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    visible: false,
    project: null,
    message: ''
  });
  
  useEffect(() => {
    dispatch(fetchProjects(filters));
  }, [dispatch, filters]);

  // Enhanced status and priority functions with icons and colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#52c41a'; // green
      case 'completed':
        return '#1890ff'; // blue
      case 'on-hold':
        return '#faad14'; // orange
      case 'cancelled':
        return '#ff4d4f'; // red
      default:
        return 'default';
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'on-hold':
        return 'On Hold';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPriorityDisplayText = (priority) => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return priority;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ff4d4f'; // red
      case 'medium':
        return '#faad14'; // orange
      case 'low':
        return '#52c41a'; // green
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚠️';
      case 'low':
        return '✅';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'completed':
        return '🔵';
      case 'on-hold':
        return '🟠';
      case 'cancelled':
        return '🔴';
      default:
        return '';
    }
  };

  const getStatusColorHex = (status) => {
    switch (status) {
      case 'active':
        return '#f6ffed'; // light green
      case 'completed':
        return '#e6f7ff'; // light blue
      case 'on-hold':
        return '#fffbe6'; // light orange
      case 'cancelled':
        return '#fff2f0'; // light red
      default:
        return '#f5f5f5'; // light gray
    }
  };

  const getPriorityColorHex = (priority) => {
    switch (priority) {
      case 'high':
        return '#fff2f0'; // light red
      case 'medium':
        return '#fffbe6'; // light orange
      case 'low':
        return '#f6ffed'; // light green
      default:
        return '#f5f5f5'; // light gray
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'active':
        return '#389e0d'; // dark green
      case 'completed':
        return '#0958d9'; // dark blue
      case 'on-hold':
        return '#d48806'; // dark orange
      case 'cancelled':
        return '#cf1322'; // dark red
      default:
        return '#595959'; // dark gray
    }
  };

  const getPriorityTextColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#cf1322'; // dark red
      case 'medium':
        return '#d48806'; // dark orange
      case 'low':
        return '#389e0d'; // dark green
      default:
        return '#595959'; // dark gray
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'active':
        return '#b7eb8f'; // green border
      case 'completed':
        return '#91caff'; // blue border
      case 'on-hold':
        return '#ffd591'; // orange border
      case 'cancelled':
        return '#ffa39e'; // red border
      default:
        return '#d9d9d9'; // gray border
    }
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ffa39e'; // red border
      case 'medium':
        return '#ffd591'; // orange border
      case 'low':
        return '#b7eb8f'; // green border
      default:
        return '#d9d9d9'; // gray border
    }
  };

  const getEnhancedTagStyle = (type, value) => {
    const baseStyle = {
      borderRadius: 12,
      fontWeight: 500,
      padding: '2px 8px',
      fontSize: 12,
      border: '1px solid',
    };
    
    if (type === 'status') {
      return {
        ...baseStyle,
        backgroundColor: getStatusColorHex(value),
        borderColor: getStatusBorderColor(value),
        color: getStatusTextColor(value),
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: getPriorityColorHex(value),
        borderColor: getPriorityBorderColor(value),
        color: getPriorityTextColor(value),
      };
    }
  };

  const renderStatusTag = (status) => (
    <Tag 
      color={getStatusColor(status)}
      style={getEnhancedTagStyle('status', status)}
    >
      {getStatusIcon(status)} {getStatusDisplayText(status)}
    </Tag>
  );

  const renderPriorityTag = (priority) => (
    <Tag 
      color={getPriorityColor(priority)}
      style={getEnhancedTagStyle('priority', priority)}
    >
      {getPriorityIcon(priority)} {getPriorityDisplayText(priority)} priority
    </Tag>
  );



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

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: ''
    });
  };

  // Handle project deletion with confirmation
  const handleDeleteProject = async (project) => {
    try {
      await dispatch(deleteProject({ projectId: project._id })).unwrap();
      message.success('Project deleted successfully');
    } catch (error) {
      // Handle confirmation required
      if (error?.status === 'confirmation_required') {
        setDeleteConfirmation({
          visible: true,
          project,
          message: error.data.message
        });
      } else {
        message.error(error || 'Failed to delete project');
      }
    }
  };

  // Confirm deletion after seeing the warning
  const confirmDeleteProject = async () => {
    const { project } = deleteConfirmation;
    try {
      await dispatch(deleteProject({ 
        projectId: project._id, 
        confirmCascade: true 
      })).unwrap();
      message.success('Project deleted successfully');
      setDeleteConfirmation({ visible: false, project: null, message: '' });
    } catch (error) {
      message.error(error || 'Failed to delete project');
      setDeleteConfirmation({ visible: false, project: null, message: '' });
    }
  };

  // Cancel deletion
  const cancelDeleteProject = () => {
    setDeleteConfirmation({ visible: false, project: null, message: '' });
  };

  // Table columns for list view
  const columns = [
    {
      title: 'Project',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar style={{ background: accent.gradient }}>
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <span>{text}</span>
          {renderStatusTag(record.status)}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Text type="secondary" ellipsis={{ tooltip: text }}>
          {text || 'No description'}
        </Text>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => renderPriorityTag(priority),
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
      render: (members) => `${members?.length || 1} members`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/projects/${record._id}`)}
          />
          <Button icon={<EditOutlined />} />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDeleteProject(record)}
          />
        </Space>
      ),
    },
  ];

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
            <Title level={2} style={{ margin: 0 }}>Projects</Title>
            <Text type="secondary">Manage your projects and track progress</Text>
          </div>
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
        </div>
        
        {/* Filters and Search */}
        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Search projects..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Status"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Select.Option value="all">All Status</Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
                <Select.Option value="on-hold">On Hold</Select.Option>
                <Select.Option value="cancelled">Cancelled</Select.Option>
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Priority"
                value={filters.priority}
                onChange={(value) => handleFilterChange('priority', value)}
              >
                <Select.Option value="all">All Priority</Select.Option>
                <Select.Option value="high">High</Select.Option>
                <Select.Option value="medium">Medium</Select.Option>
                <Select.Option value="low">Low</Select.Option>
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Button onClick={clearFilters} icon={<FilterOutlined />}>
                Clear Filters
              </Button>
            </Col>
            <Col xs={12} md={4}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button
                  icon={<AppstoreOutlined />}
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                />
                <Button
                  icon={<UnorderedListOutlined />}
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                />
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {projects.length === 0 ? (
        <Empty
          description="No projects found"
          style={{ marginTop: 100 }}
        >
          <Button
            type="primary"
            onClick={() => dispatch(openModal({ modal: 'projectCreate' }))}
            style={{ background: accent.gradient, border: 'none' }}
          >
            Create Project
          </Button>
        </Empty>
      ) : (
        viewMode === 'grid' ? (
          <Row gutter={[24, 24]}>
            {projects.map((project) => (
              <Col xs={24} sm={12} lg={8} key={project._id}>
                <motion.div variants={itemVariants}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 16,
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                    actions={[
                      <EyeOutlined key="view" onClick={() => navigate(`/projects/${project._id}`)} />, 
                      <EditOutlined key="edit" />,
                      <Dropdown
                        key="more"
                        menu={{
                          items: [
                            { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
                            { 
                              key: 'delete', 
                              icon: <DeleteOutlined />, 
                              label: 'Delete', 
                              danger: true,
                              onClick: () => handleDeleteProject(project)
                            },
                          ],
                        }}
                      >
                        <MoreOutlined />
                      </Dropdown>,
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        <Avatar
                          size={48}
                          style={{
                            background: accent.gradient,
                            fontSize: 20,
                            fontWeight: 'bold',
                          }}
                        >
                          {project.name.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      title={
                        <Space>
                          {project.name}
                          {renderStatusTag(project.status)}
                        </Space>
                      }
                      description={
                        <Text type="secondary" ellipsis>
                          {project.description || 'No description'}
                        </Text>
                      }
                    />
                    <div style={{ marginTop: 16 }}>
                      <Space>
                        {renderPriorityTag(project.priority)}
                        <Text type="secondary">
                          {project.members?.length || 1} members
                        </Text>
                      </Space>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        ) : (
          <Table
            dataSource={projects}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            style={{ background: 'white', borderRadius: 12 }}
          />
        )
      )}
      <CreateProjectModal />
      
      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Project Deletion"
        open={deleteConfirmation.visible}
        onOk={confirmDeleteProject}
        onCancel={cancelDeleteProject}
        okText="Delete Project"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>{deleteConfirmation.message}</p>
        <p style={{ color: '#ff4d4f', fontWeight: 500 }}>
          This action cannot be undone.
        </p>
      </Modal>
    </motion.div>
  );
};

export default Projects;
