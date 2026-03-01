import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Card,
  Typography,
  Button,
  Input,
  Modal,
  Form,
  Select,
  DatePicker,
  Tag,
  Avatar,
  Space,
  Spin,
  Dropdown,
  Menu,
  Badge,
  Row,
  Col,
  Table,
  Switch,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  ArrowLeftOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  CalendarOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FilterOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import moment from 'moment';
import { boardService, columnService, taskService } from '../services/boardService';
import { projectService } from '../services/projectService';
import { selectAccentPreset } from '../store/slices/uiSlice';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Board = () => {
  const { projectId, boardId } = useParams();
  const navigate = useNavigate();
  const accent = useSelector(selectAccentPreset);
  
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [taskForm] = Form.useForm();
  
  // New state for enhanced features
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    date: new Date() // Default to today
  });
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    loadBoardData();
  }, [boardId]);

  useEffect(() => {
    // Apply filters to all tasks
    const allTasks = columns.flatMap(column => 
      column.tasks?.map(task => ({ ...task, column: column.name })) || []
    ) || [];
    
    let filtered = allTasks;
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    
    // Apply priority filter
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    
    // Apply date filter
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === filterDate.toDateString();
      });
    }
    
    setFilteredTasks(filtered);
  }, [columns, filters]);

  const loadBoardData = async () => {
    try {
      setLoading(true);
      const [boardRes, projectRes] = await Promise.all([
        boardService.getBoard(boardId),
        projectService.getProject(projectId)
      ]);
      setBoard(boardRes.data.board);
      setColumns(boardRes.data.columns);
      setProject(projectRes.data.project);
    } catch (error) {
      toast.error('Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;
    
    // Handle task reordering/moving
    if (type === 'DEFAULT' || !type) {
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      // Optimistic update
      const newColumns = [...columns];
      const sourceColumn = newColumns.find(col => col._id === source.droppableId);
      const destColumn = newColumns.find(col => col._id === destination.droppableId);

      if (!sourceColumn || !destColumn) return;

      const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
      destColumn.tasks.splice(destination.index, 0, movedTask);
      setColumns(newColumns);

      // Determine new status based on destination column
      let newStatus = movedTask.status;
      const destColName = destColumn.name.toLowerCase();
      
      if (destColName.includes('todo') || destColName.includes('to do') || destColName.includes('backlog')) {
        newStatus = 'todo';
      } else if (destColName.includes('progress') || destColName.includes('doing') || destColName.includes('active')) {
        newStatus = 'in-progress';
      } else if (destColName.includes('done') || destColName.includes('complete') || destColName.includes('finished')) {
        newStatus = 'done';
      }

      const isSameColumn = source.droppableId === destination.droppableId;
      const statusChanged = newStatus !== movedTask.status;

      // API call
      try {
        // Move task (handles both reordering within column and moving between columns)
        await columnService.moveTask({
          sourceColumnId: source.droppableId,
          destinationColumnId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
          taskId: draggableId
        });
        
        // Update task status if moved to different column with different status
        if (!isSameColumn && statusChanged) {
          await taskService.updateTask(draggableId, { status: newStatus });
        }
        
        const message = isSameColumn ? 'Task reordered' : 'Task moved successfully';
        toast.success(message);
      } catch (error) {
        console.error('Drag and drop error:', error);
        toast.error('Failed to move task');
        loadBoardData(); // Revert on error
      }
    }
  };

  const handleAddTask = (columnId) => {
    setSelectedColumnId(columnId);
    setSelectedTask(null);
    taskForm.resetFields();
    setTaskModalVisible(true);
  };

  const handleEditTask = (task) => {
    console.log('Editing task:', task);
    
    // Ensure task has column reference
    const taskWithColumn = {
      ...task,
      column: task.column?._id || task.column || task.columnId
    };
    
    setSelectedTask(taskWithColumn);
    const formValues = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? moment(task.dueDate) : null,
    };
    console.log('Setting form values:', formValues);
    taskForm.setFieldsValue(formValues);
    setTaskModalVisible(true);
  };

  const handleTaskSubmit = async (values) => {
    console.log('Task submit called with values:', values);
    console.log('Selected task:', selectedTask);
    try {
      if (selectedTask) {
        console.log('Updating task:', selectedTask._id);
        
        // Check if status changed
        const oldStatus = selectedTask.status;
        const newStatus = values.status;
        const statusChanged = oldStatus !== newStatus;
        
        // Update task data
        await taskService.updateTask(selectedTask._id, values);
        
        // If status changed, move task to appropriate column
        if (statusChanged) {
          const targetColumn = findColumnByStatus(newStatus);
          const currentColumn = columns.find(col => col._id === selectedTask.column);
          
          if (targetColumn && currentColumn && targetColumn._id !== currentColumn._id) {
            // Move task to new column
            await columnService.moveTask({
              sourceColumnId: currentColumn._id,
              destinationColumnId: targetColumn._id,
              sourceIndex: currentColumn.tasks.findIndex(t => t._id === selectedTask._id),
              destinationIndex: targetColumn.tasks.length,
              taskId: selectedTask._id
            });
          }
        }
        
        toast.success('Task updated successfully');
      } else {
        console.log('Creating new task in column:', selectedColumnId);
        await taskService.createTask(boardId, { ...values, columnId: selectedColumnId });
        toast.success('Task created successfully');
      }
      setTaskModalVisible(false);
      loadBoardData();
    } catch (error) {
      console.error('Task submit error:', error);
      toast.error('Failed to save task');
    }
  };

  // Helper function to find column by status
  const findColumnByStatus = (status) => {
    return columns.find(col => {
      const colName = col.name.toLowerCase();
      if (status === 'todo') {
        return colName.includes('todo') || colName.includes('to do') || colName.includes('backlog');
      } else if (status === 'in-progress') {
        return colName.includes('progress') || colName.includes('doing') || colName.includes('active');
      } else if (status === 'done') {
        return colName.includes('done') || colName.includes('complete') || colName.includes('finished');
      }
      return false;
    });
  };

  const handleDeleteTask = async (taskId) => {
    Modal.confirm({
      title: 'Delete Task',
      content: 'Are you sure you want to delete this task? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await taskService.deleteTask(taskId);
          toast.success('Task deleted successfully');
          loadBoardData();
        } catch (error) {
          toast.error('Failed to delete task');
        }
      },
    });
  };

  const handleAddColumn = async () => {
    Modal.confirm({
      title: 'Add Column',
      content: (
        <Input placeholder="Column name" id="columnName" />
      ),
      onOk: async () => {
        const name = document.getElementById('columnName').value;
        if (!name) return;
        try {
          await columnService.createColumn(boardId, { name });
          toast.success('Column created');
          loadBoardData();
        } catch (error) {
          toast.error('Failed to create column');
        }
      },
    });
  };

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
      case 'todo':
        return '#1890ff'; // blue
      case 'in-progress':
        return '#faad14'; // orange
      case 'done':
        return '#52c41a'; // green
      default:
        return 'default';
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    return null; // Removed emojis for professional appearance
  };

  const getStatusColorHex = (status) => {
    switch (status) {
      case 'todo':
        return '#e6f7ff'; // light blue
      case 'in-progress':
        return '#fffbe6'; // light orange
      case 'done':
        return '#f6ffed'; // light green
      default:
        return '#f5f5f5'; // light gray
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'todo':
        return '#0958d9'; // dark blue
      case 'in-progress':
        return '#d48806'; // dark orange
      case 'done':
        return '#389e0d'; // dark green
      default:
        return '#595959'; // dark gray
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'todo':
        return '#91caff'; // blue border
      case 'in-progress':
        return '#ffd591'; // orange border
      case 'done':
        return '#b7eb8f'; // green border
      default:
        return '#d9d9d9'; // gray border
    }
  };

  const getEnhancedStatusTagStyle = (status) => ({
    borderRadius: 12,
    fontWeight: 500,
    padding: '2px 8px',
    fontSize: 12,
    border: '1px solid',
    backgroundColor: getStatusColorHex(status),
    borderColor: getStatusBorderColor(status),
    color: getStatusTextColor(status),
  });

  const renderStatusTag = (status) => (
    <Tag 
      color={getStatusColor(status)}
      style={getEnhancedStatusTagStyle(status)}
    >
      {getStatusDisplayText(status)}
    </Tag>
  );

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
      search: '',
      date: new Date() // Reset to today
    });
  };

  // Set date filter to today
  const setToday = () => {
    setFilters(prev => ({
      ...prev,
      date: new Date()
    }));
  };

  // Set date filter to tomorrow
  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFilters(prev => ({
      ...prev,
      date: tomorrow
    }));
  };

  // Set date filter to this week
  const setThisWeek = () => {
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    setFilters(prev => ({
      ...prev,
      date: endOfWeek
    }));
  };

  // Table columns for list view
  const tableColumns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.project?.name || 'No Project'}
          </Text>
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
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Column',
      dataIndex: 'column',
      key: 'column',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date ? format(parseISO(date), 'MMM d, yyyy') : 'No due date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditTask(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDeleteTask(record._id)}
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Back
            </Button>
            <div>
              <Title level={3} style={{ margin: 0 }}>{board?.name}</Title>
              <Text type="secondary">{project?.name}</Text>
            </div>
          </Space>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === 'board' ? 'primary' : 'default'}
              onClick={() => setViewMode('board')}
            />
            <Button
              icon={<UnorderedListOutlined />}
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            />
          </div>
        </div>
        
        {/* Filters and Search */}
        {viewMode === 'list' && (
          <Card style={{ borderRadius: 12, marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <Input
                  placeholder="Search tasks..."
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
                  onChange={(value) => handleFilterChange('priority', value)}
                >
                  <Select.Option value="all">All Priority</Select.Option>
                  <Select.Option value="high">High</Select.Option>
                  <Select.Option value="medium">Medium</Select.Option>
                  <Select.Option value="low">Low</Select.Option>
                </Select>
              </Col>
              <Col xs={12} md={4}>
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Filter by date"
                  value={filters.date ? moment(filters.date) : null}
                  onChange={(date) => handleFilterChange('date', date ? date.toDate() : null)}
                  allowClear
                />
              </Col>
              <Col xs={24} md={8}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <Button.Group>
                    <Button onClick={setToday}>Today</Button>
                    <Button onClick={setTomorrow}>Tomorrow</Button>
                    <Button onClick={setThisWeek}>This Week</Button>
                    <Button onClick={clearFilters} icon={<FilterOutlined />}>
                      Clear
                    </Button>
                  </Button.Group>
                  <Text type="secondary">
                    Showing {filteredTasks.length} of {columns.flatMap(c => c.tasks || []).length} tasks
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </div>

      {/* Main Content */}
      {viewMode === 'board' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
            <div style={{ display: 'flex', gap: 16, height: '100%', paddingBottom: 16 }}>
              {columns.map((column) => (
                <div key={column._id} style={{ width: 300, flexShrink: 0 }}>
                  <Card
                    title={
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>{column.name}</Text>
                        <Badge 
                          count={column.tasks?.length || 0} 
                          showZero 
                          style={{ backgroundColor: '#1890ff' }}
                        />
                      </Space>
                    }
                    extra={
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddTask(column._id)}
                        style={{ color: '#1890ff' }}
                      />
                    }
                    style={{
                      height: '100%',
                      background: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid #e8e8e8',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    bodyStyle={{ 
                      padding: 12, 
                      overflowY: 'auto', 
                      maxHeight: 'calc(100vh - 300px)',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <Droppable droppableId={column._id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{ 
                            minHeight: 100,
                            backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
                            borderRadius: 8,
                            transition: 'background-color 0.2s ease',
                            padding: 4
                          }}
                        >
                          {column.tasks?.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  whileHover={{ scale: snapshot.isDragging ? 1 : 1.02 }}
                                  style={{
                                    marginBottom: 8,
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <Card
                                    size="small"
                                    onClick={() => !snapshot.isDragging && handleEditTask(task)}
                                    style={{
                                      cursor: 'grab',
                                      borderRadius: 8,
                                      border: snapshot.isDragging 
                                        ? '2px solid #1890ff' 
                                        : '1px solid #f0f0f0',
                                      boxShadow: snapshot.isDragging
                                        ? '0 12px 24px rgba(0,0,0,0.15)'
                                        : '0 2px 8px rgba(0,0,0,0.08)',
                                      opacity: snapshot.isDragging ? 0.9 : 1,
                                      transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                      transition: 'all 0.2s ease',
                                      background: snapshot.isDragging ? '#e6f7ff' : '#ffffff',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!snapshot.isDragging) {
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!snapshot.isDragging) {
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.transform = 'none';
                                      }
                                    }}
                                  >
                                    {/* Task Header with Drag Indicator */}
                                    <div 
                                      style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        marginBottom: 8,
                                        paddingBottom: 8,
                                        borderBottom: '1px dashed #e8e8e8',
                                      }}
                                    >
                                      <HolderOutlined style={{ 
                                        color: '#bfbfbf', 
                                        fontSize: 14,
                                        marginRight: 8
                                      }} />
                                      <Text strong style={{ fontSize: 14, lineHeight: '20px', flex: 1 }}>
                                        {task.title}
                                      </Text>
                                    </div>
                                    
                                    {/* Task Content */}
                                    <div>
                                      {task.description && (
                                        <Text type="secondary" ellipsis style={{ display: 'block', fontSize: 12, lineHeight: '18px', marginBottom: 8 }}>
                                          {task.description}
                                        </Text>
                                      )}
                                      <Space style={{ marginTop: 8 }} wrap>
                                        <Tag color={getPriorityColor(task.priority)} size="small">
                                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </Tag>
                                        {task.dueDate && (
                                          <Tag icon={<ClockCircleOutlined />} size="small">
                                            {format(parseISO(task.dueDate), 'MMM d')}
                                          </Tag>
                                        )}
                                      </Space>
                                    </div>
                                  </Card>
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Card>
                </div>
              ))}

              {/* Add Column */}
              <Card
                hoverable
                onClick={handleAddColumn}
                style={{
                  width: 300,
                  flexShrink: 0,
                  borderStyle: 'dashed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                }}
              >
                <Space direction="vertical" align="center">
                  <PlusOutlined style={{ fontSize: 24 }} />
                  <Text>Add Column</Text>
                </Space>
              </Card>
            </div>
          </div>
        </DragDropContext>
      ) : (
        <Card style={{ borderRadius: 12 }}>
          <Table
            dataSource={filteredTasks}
            columns={tableColumns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </Card>
      )}

      {/* Task Modal */}
      <Modal
        title={selectedTask ? 'Edit Task' : 'New Task'}
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleTaskSubmit}
          initialValues={{
            priority: 'medium',
            status: 'todo',
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="Task title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Task description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="todo">To Do</Option>
                  <Option value="in-progress">In Progress</Option>
                  <Option value="done">Done</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dueDate" label="Due Date">
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="Select due date"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setTaskModalVisible(false)}>
                Cancel
              </Button>
              {selectedTask && (
                <Button 
                  danger 
                  onClick={() => {
                    handleDeleteTask(selectedTask._id);
                    setTaskModalVisible(false);
                  }}
                >
                  Delete Task
                </Button>
              )}
              <Button 
                type="primary" 
                htmlType="submit" 
                style={{ background: accent.gradient, border: 'none' }}
              >
                {selectedTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default Board;
