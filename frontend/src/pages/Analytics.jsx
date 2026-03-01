import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Row, Col, Statistic, Spin, Empty, Tag, Progress } from 'antd';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  RiseOutlined,
  ProjectOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { fetchMyTasks, selectAllTasks, selectTasksLoading } from '../store/slices/taskSlice';
import { selectAccentPreset } from '../store/slices/uiSlice';

const { Title, Text } = Typography;

const COLORS = {
  todo: '#8c8c8c',
  'in-progress': '#1890ff',
  done: '#52c41a',
  high: '#ff4d4f',
  medium: '#faad14',
  low: '#52c41a',
};

const Analytics = () => {
  const dispatch = useDispatch();
  const accent = useSelector(selectAccentPreset);
  const tasks = useSelector(selectAllTasks);
  const loading = useSelector(selectTasksLoading);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dispatch(fetchMyTasks());
  }, [dispatch]);

  useEffect(() => {
    if (tasks.length > 0) {
      calculateStats();
    }
  }, [tasks]);

  const calculateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;

    const highPriority = tasks.filter((t) => t.priority === 'high').length;
    const mediumPriority = tasks.filter((t) => t.priority === 'medium').length;
    const lowPriority = tasks.filter((t) => t.priority === 'low').length;

    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Group by project
    const projectStats = {};
    tasks.forEach((task) => {
      const projectName = task.project?.name || 'Unknown Project';
      if (!projectStats[projectName]) {
        projectStats[projectName] = { total: 0, completed: 0 };
      }
      projectStats[projectName].total++;
      if (task.status === 'done') {
        projectStats[projectName].completed++;
      }
    });

    setStats({
      total,
      completed,
      inProgress,
      todo,
      highPriority,
      mediumPriority,
      lowPriority,
      overdue,
      completionRate,
      projectStats,
    });
  };

  const getStatusData = () => [
    { name: 'To Do', value: stats?.todo || 0, color: COLORS.todo },
    { name: 'In Progress', value: stats?.inProgress || 0, color: COLORS['in-progress'] },
    { name: 'Done', value: stats?.completed || 0, color: COLORS.done },
  ];

  const getPriorityData = () => [
    { name: 'High', value: stats?.highPriority || 0, color: COLORS.high },
    { name: 'Medium', value: stats?.mediumPriority || 0, color: COLORS.medium },
    { name: 'Low', value: stats?.lowPriority || 0, color: COLORS.low },
  ];

  const getProjectData = () => {
    if (!stats?.projectStats) return [];
    return Object.entries(stats.projectStats).map(([name, data]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      total: data.total,
      completed: data.completed,
      progress: Math.round((data.completed / data.total) * 100),
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Analytics</Title>
          <Text type="secondary">Track project performance and metrics</Text>
        </div>
        <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Empty description="No tasks found. Create some tasks to see analytics!" />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Analytics</Title>
        <Text type="secondary">Track project performance and metrics</Text>
      </div>

      {/* Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Total Tasks"
              value={stats.total}
              prefix={<FileTextOutlined style={{ color: accent.primary }} />}
              valueStyle={{ color: accent.primary, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="In Progress"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Completion Rate"
              value={stats.completionRate}
              suffix="%"
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Tasks by Status"
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Tasks by Priority"
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getPriorityData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={accent.primary} radius={[4, 4, 0, 0]}>
                  {getPriorityData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Project Progress */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="Project Progress"
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            {getProjectData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getProjectData()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    labelFormatter={(label) => `Project: ${label}`}
                  />
                  <Bar dataKey="progress" fill={accent.primary} radius={[0, 4, 4, 0]}>
                    {getProjectData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.progress === 100 ? '#52c41a' : accent.primary}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No project data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Priority & Overdue Summary */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Text type="secondary">High Priority Tasks</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="red" style={{ fontSize: 16, padding: '4px 12px' }}>
                {stats.highPriority} tasks
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Text type="secondary">Overdue Tasks</Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="orange" style={{ fontSize: 16, padding: '4px 12px' }}>
                {stats.overdue} tasks
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Text type="secondary">Overall Progress</Text>
            <Progress
              percent={stats.completionRate}
              status={stats.completionRate === 100 ? 'success' : 'active'}
              strokeColor={accent.gradient}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Analytics;
