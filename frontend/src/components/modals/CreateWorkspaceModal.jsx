import { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useDispatch } from 'react-redux';
import { createWorkspace } from '../../store/slices/workspaceSlice';

const { TextArea } = Input;

const CreateWorkspaceModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await dispatch(createWorkspace(values)).unwrap();
      message.success('Workspace created successfully');
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error || 'Failed to create workspace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Create New Workspace"
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ role: 'member' }}
      >
        <Form.Item
          name="name"
          label="Workspace Name"
          rules={[
            { required: true, message: 'Please enter workspace name' },
            { max: 100, message: 'Name cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter workspace name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ max: 500, message: 'Description cannot exceed 500 characters' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Enter workspace description (optional)" 
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
            >
              Create Workspace
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
