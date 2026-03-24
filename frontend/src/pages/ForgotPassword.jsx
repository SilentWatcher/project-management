import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
} from 'antd';
import {
  MailOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useSelector } from 'react-redux';
import { selectAccentPreset } from '../store/slices/uiSlice';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const accent = useSelector(selectAccentPreset);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await authService.forgotPassword(values.email);
      setSuccess(true);
      toast.success(response.message || 'Reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Gradient Orbs */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: accent.gradient,
          opacity: 0.1,
          filter: 'blur(100px)',
          top: -200,
          right: -200,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: accent.gradient,
          opacity: 0.08,
          filter: 'blur(80px)',
          bottom: -100,
          left: -100,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: accent.gradient,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: 40, fontWeight: 'bold', color: 'white' }}>
              T
            </span>
          </motion.div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            <span className="gradient-text">Reset Password</span>
          </Title>
          <Text type="secondary">Enter your email to receive a password reset link</Text>
        </div>

        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: 'none',
          }}
          styles={{ body: { padding: 40 } }}
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Alert
                message="Check your email"
                description="We've sent a password reset link to your email address. Please check your inbox and follow the instructions."
                type="success"
                showIcon
                style={{ marginBottom: 24, borderRadius: 8 }}
              />
              <Button
                type="primary"
                block
                onClick={() => navigate('/login')}
                style={{
                  height: 48,
                  borderRadius: 8,
                  background: accent.gradient,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Back to Login
              </Button>
            </motion.div>
          ) : (
            <Form
              name="forgot-password"
              onFinish={handleSubmit}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: 'var(--text-tertiary)' }} />}
                  placeholder="Email address"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{
                    height: 48,
                    borderRadius: 8,
                    background: accent.gradient,
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  Send Reset Link
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link
            to="/login"
            style={{
              color: accent.primary,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ArrowLeftOutlined />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
