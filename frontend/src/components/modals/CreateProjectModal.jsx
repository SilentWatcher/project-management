import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
} from 'antd';
import { createProject } from '../../store/slices/projectSlice';
import { closeModal, selectModals, selectAccentPreset } from '../../store/slices/uiSlice';
import { toast } from 'react-toastify';

const { TextArea } = Input;
const { Option } = Select;

const CreateProjectModal = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const modals = useSelector(selectModals);
  const accent = useSelector(selectAccentPreset);
  const isOpen = modals.projectCreate;

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  const handleCancel = () => {
    dispatch(closeModal({ modal: 'projectCreate' }));
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    const result = await dispatch(createProject(values));
    
    if (createProject.fulfilled.match(result)) {
      toast.success('Project created successfully!');
      dispatch(closeModal({ modal: 'projectCreate' }));
      form.resetFields();
    } else {
      toast.error(result.payload || 'Failed to create project');
    }
  };

  return (
    <Modal
      title="Create New Project"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={520}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="name"
          label="Project Name"
          rules={[
            { required: true, message: 'Please enter project name' },
            { max: 100, message: 'Name cannot exceed 100 characters' },
          ]}
        >
          <Input
            placeholder="Enter project name"
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { max: 500, message: 'Description cannot exceed 500 characters' },
          ]}
        >
          <TextArea
            placeholder="Enter project description (optional)"
            rows={4}
            style={{ borderRadius: 8, resize: 'none' }}
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          initialValue="medium"
          rules={[{ required: true, message: 'Please select priority' }]}
        >
          <Select size="large" style={{ borderRadius: 8 }}>
            <Option value="low">
              <span style={{ color: '#52c41a' }}>●</span> Low
            </Option>
            <Option value="medium">
              <span style={{ color: '#faad14' }}>●</span> Medium
            </Option>
            <Option value="high">
              <span style={{ color: '#f5222d' }}>●</span> High
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          initialValue="active"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select size="large" style={{ borderRadius: 8 }}>
            <Option value="active">Active</Option>
            <Option value="on-hold">On Hold</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              size="large"
              onClick={handleCancel}
              style={{ borderRadius: 8 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                borderRadius: 8,
                background: accent.gradient,
                border: 'none',
              }}
            >
              Create Project
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;
