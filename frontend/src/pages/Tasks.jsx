import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Typography,
  List,
  Tag,
  Space,
  Empty,
  Spin,
  Avatar,
  Button,
  Badge,
  Input,
  Select,
  Row,
  Col,
  Tabs,
  Checkbox,
  Tooltip,
  DatePicker,
  Statistic,
  Progress,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FlagOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  EyeOutlined,
  ProjectOutlined,
  DashboardOutlined,
  BarChartOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { format, parseISO, isPast, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fetchMyTasks, selectAllTasks, selectTasksLoading, updateTask } from '../store/slices/taskSlice';
import { selectAccentPreset } from '../store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const Tasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accent = useSelector(selectAccentPreset);
  const tasks = useSelector(selectAllTasks);
  const loading = useSelector(selectTasksLoading);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    dateRange: null,
  });
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'

  useEffect(() => {
    dispatch(fetchMyTasks());
  }, [dispatch]);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in-progress':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const filterTasks = (taskList) => {
    return taskList.filter((task) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          task.title?.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm) ||
          task.project?.name?.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Date range filter
      if (filters.dateRange && task.dueDate) {
        const taskDate = parseISO(task.dueDate);
        const [start, end] = filters.dateRange;
        if (taskDate < start || taskDate > end) {
          return false;
        }
      }

      return true;
    });
  };

  const getTasksByTab = () => {
    switch (activeTab) {
      case 'today':
        return tasks.filter((task) => task.dueDate && isToday(parseISO(task.dueDate)));
      case 'upcoming':
        return tasks.filter(
          (task) =>
            task.dueDate &&
            !isPast(parseISO(task.dueDate)) &&
            !isToday(parseISO(task.dueDate)) &&
            task.status !== 'done'
        );
      case 'overdue':
        return tasks.filter(
          (task) =>
            task.dueDate &&
            isPast(parseISO(task.dueDate)) &&
            !isToday(parseISO(task.dueDate)) &&
            task.status !== 'done'
        );
      case 'completed':
        return tasks.filter((task) => task.status === 'done');
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasks(getTasksByTab());

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await dispatch(updateTask({ taskId, updates: { status: newStatus } })).unwrap();
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleNavigateToTask = (task) => {
    if (task.project?._id && task.board?._id) {
      navigate(`/projects/${task.project._id}/boards/${task.board._id}`);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      dateRange: null,
    });
  };

  const setDateRangePreset = (preset) => {
    const today = new Date();
    let start, end;
    
    switch (preset) {
      case 'today':
        start = end = today;
        break;
      case 'week':
        start = startOfWeek(today);
        end = endOfWeek(today);
        break;
      case 'overdue':
        start = new Date(2000, 0, 1);
        end = new Date(today);
        end.setDate(end.getDate() - 1);
        break;
      default:
        start = end = null;
    }
    
    setFilters(prev => ({
      ...prev,
      dateRange: start && end ? [start, end] : null
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const renderTaskItem = (task) => (
    <motion.div variants={itemVariants}>
      <List.Item
        style={{
          padding: '16px 0',
          borderBottom: '1px solid var(--border-color)',
          background: task.status === 'done' ? '#f6ffed' : 'transparent',
          borderRadius: 8,
          paddingLeft: 12,
          paddingRight: 12,
          marginBottom: 8,
        }}
        actions={[
          <Tooltip title="View in Board">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleNavigateToTask(task)}
            />
          </Tooltip>,
        ]}
      >
        <List.Item.Meta
          avatar={
            <Checkbox
              checked={task.status === 'done'}
              onChange={(e) => handleStatusChange(task._id, e.target.checked ? 'done' : 'todo')}
            />
          }
          title={
            <Space>
              <Text
                strong
                style={{
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  opacity: task.status === 'done' ? 0.6 : 1,
                  fontSize: 15,
                }}
              >
                {task.title}
              </Text>
              <Tag color={getPriorityColor(task.priority)} size="small">
                {task.priority}
              </Tag>
            </Space>
          }
          description={
            <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
              <Text type="secondary">{task.project?.name}</Text>
              <Space>
                <Tag color={getStatusColor(task.status)} size="small">
                  {task.status === 'done' ? 'Done' : task.status === 'in-progress' ? 'In Progress' : 'To Do'}
                </Tag>
                {task.dueDate && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      color:
                        isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) && task.status !== 'done'
                          ? '#ff4d4f'
                          : undefined,
                    }}
                  >
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {isToday(parseISO(task.dueDate))
                      ? 'Today'
                      : isTomorrow(parseISO(task.dueDate))
                      ? 'Tomorrow'
                      : format(parseISO(task.dueDate), 'MMM d, yyyy')}
                  </Text>
                )}
              </Space>
            </Space>
          }
        />
      </List.Item>
    </motion.div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>My Tasks</Title>
        <Text type="secondary">Manage and track your tasks across all projects</Text>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card style={{ borderRadius: 12, textAlign: 'center' }}>
              <Statistic
                title="Total Tasks"
                value={tasks.length}
                valueStyle={{ color: '#1890ff', fontSize: 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ borderRadius: 12, textAlign: 'center' }}>
              <Statistic
                title="Completed"
                value={tasks.filter(t => t.status === 'done').length}
                valueStyle={{ color: '#52c41a', fontSize: 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ borderRadius: 12, textAlign: 'center' }}>
              <Statistic
                title="In Progress"
                value={tasks.filter(t => t.status === 'in-progress').length}
                valueStyle={{ color: '#faad14', fontSize: 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ borderRadius: 12, textAlign: 'center' }}>
              <Statistic
                title="Overdue"
                value={tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)) && t.status !== 'done').length}
                valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card
          style={{
            borderRadius: 12,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: 24,
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <Input
                placeholder="Search tasks..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
              />
            </Col>
            <Col xs={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Status"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
              >
                <Select.Option value="all">All Status</Select.Option>
                <Select.Option value="todo">To Do</Select.Option>
                <Select.Option value="in-progress">In Progress</Select.Option>
                <Select.Option value="done">Done</Select.Option>
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Priority"
                value={filters.priority}
                onChange={(value) => setFilters({ ...filters, priority: value })}
              >
                <Select.Option value="all">All Priority</Select.Option>
                <Select.Option value="high">High</Select.Option>
                <Select.Option value="medium">Medium</Select.Option>
                <Select.Option value="low">Low</Select.Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Space>
                <RangePicker
                  style={{ width: '100%' }}
                  value={filters.dateRange}
                  onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                  placeholder={['Start Date', 'End Date']}
                />
              </Space>
            </Col>
            <Col xs={24} md={4}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button.Group>
                  <Button size="small" onClick={() => setDateRangePreset('today')}>Today</Button>
                  <Button size="small" onClick={() => setDateRangePreset('week')}>Week</Button>
                  <Button size="small" onClick={() => setDateRangePreset('overdue')}>Overdue</Button>
                </Button.Group>
                <Button onClick={clearFilters} icon={<FilterOutlined />} size="small">
                  Clear
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Task List with Tabs */}
      <motion.div variants={itemVariants}>
        <Card
          style={{
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane
              tab={`All Tasks (${tasks.length})`}
              key="all"
            />
            <TabPane
              tab={`Today (${tasks.filter((t) => t.dueDate && isToday(parseISO(t.dueDate))).length})`}
              key="today"
            />
            <TabPane
              tab={`Upcoming (${tasks.filter((t) => t.dueDate && !isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)) && t.status !== 'done').length})`}
              key="upcoming"
            />
            <TabPane
              tab={`Overdue (${tasks.filter((t) => t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)) && t.status !== 'done').length})`}
              key="overdue"
            />
            <TabPane
              tab={`Completed (${tasks.filter((t) => t.status === 'done').length})`}
              key="completed"
            />
          </Tabs>

          {filteredTasks.length === 0 ? (
            <Empty description="No tasks found matching your filters" />
          ) : (
            <List
              dataSource={filteredTasks}
              renderItem={renderTaskItem}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} tasks`,
              }}
            />
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Tasks;
