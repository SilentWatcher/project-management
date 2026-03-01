import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Calendar as AntCalendar, Badge, List, Tag, Spin, Row, Col, Empty, Space } from 'antd';
import { format, parseISO, isSameDay, isPast, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { fetchMyTasks, selectAllTasks, selectTasksLoading } from '../store/slices/taskSlice';
import { selectAccentPreset } from '../store/slices/uiSlice';

const { Title, Text } = Typography;

const Calendar = () => {
  const dispatch = useDispatch();
  const accent = useSelector(selectAccentPreset);
  const tasks = useSelector(selectAllTasks);
  const loading = useSelector(selectTasksLoading);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = parseISO(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  // Custom date cell render
  const dateCellRender = (date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {dayTasks.slice(0, 3).map((task) => (
          <li key={task._id} style={{ marginBottom: 2 }}>
            <Badge
              color={getPriorityColor(task.priority)}
              text={
                <Text ellipsis style={{ fontSize: 11, width: 60 }}>
                  {task.title}
                </Text>
              }
            />
          </li>
        ))}
        {dayTasks.length > 3 && (
          <li>
            <Text type="secondary" style={{ fontSize: 10 }}>
              +{dayTasks.length - 3} more
            </Text>
          </li>
        )}
      </ul>
    );
  };

  // Handle date selection
  const onSelect = (date) => {
    setSelectedDate(date.toDate());
  };

  const selectedTasks = getTasksForDate(selectedDate);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Calendar</Title>
        <Text type="secondary">View and manage your tasks by due date</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Calendar */}
        <Col xs={24} lg={16}>
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <AntCalendar
              dateCellRender={dateCellRender}
              onSelect={onSelect}
              value={selectedDate}
              style={{ borderRadius: 12 }}
            />
          </Card>
        </Col>

        {/* Selected Date Tasks */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: accent.primary }} />
                <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </Space>
            }
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            {selectedTasks.length === 0 ? (
              <Empty description="No tasks for this date" />
            ) : (
              <List
                dataSource={selectedTasks}
                renderItem={(task) => (
                  <List.Item
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text
                            style={{
                              textDecoration: task.status === 'done' ? 'line-through' : 'none',
                              opacity: task.status === 'done' ? 0.6 : 1,
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
                          <Tag color={getStatusColor(task.status)} size="small">
                            {task.status === 'done' ? (
                              <><CheckCircleOutlined /> Done</>
                            ) : task.status === 'in-progress' ? (
                              <><ClockCircleOutlined /> In Progress</>
                            ) : (
                              'To Do'
                            )}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          {/* Upcoming Tasks Summary */}
          <Card
            title="Upcoming Tasks"
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginTop: 24,
            }}
          >
            <List
              dataSource={tasks
                .filter((task) => task.dueDate && new Date(task.dueDate) >= new Date())
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5)}
              renderItem={(task) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Text strong ellipsis style={{ maxWidth: 250 }}>
                      {task.title}
                    </Text>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {format(parseISO(task.dueDate), 'MMM d')}
                      </Text>
                      <Tag color={getPriorityColor(task.priority)} size="small">
                        {task.priority}
                      </Tag>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Calendar;
