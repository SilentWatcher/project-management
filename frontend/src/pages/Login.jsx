import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  Alert,
  Spin,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  GithubOutlined,
  GoogleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { login, selectAuthLoading, selectAuthError, clearError, selectIsAuthenticated } from '../store/slices/authSlice';
import { selectAccentPreset } from '../store/slices/uiSlice';

const { Title, Text } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accent = useSelector(selectAccentPreset);

  // Debug logs
  console.log('Login component state:', { loading, error, isAuthenticated });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    console.log('isAuthenticated changed:', isAuthenticated);
    if (isAuthenticated) {
      console.log('Navigating to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      // Clear error after showing toast
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSubmit = async (values) => {
    console.log('handleSubmit called with:', values);
    console.log('Current loading state:', loading);
    
    try {
      const result = await dispatch(login(values));
      console.log('Dispatch result:', result);
      
      if (login.fulfilled.match(result)) {
        console.log('Login fulfilled');
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      } else if (login.rejected.match(result)) {
        console.log('Login rejected:', result.payload);
        // Error already handled by the error effect
      }
    } catch (error) {
      console.error('Login error:', error);
      // Ensure loading stops even on unhandled errors
      dispatch({ type: 'auth/login/rejected' });
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
            <span className="gradient-text">Welcome Back</span>
          </Title>
          <Text type="secondary">Sign in to continue to Zenkai</Text>
        </div>

        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: 'none',
          }}
          styles={{ body: { padding: 40 } }}
        >
          <Form
            name="login"
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
                prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
                placeholder="Email address"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
                placeholder="Password"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <Link
                to="/forgot-password"
                style={{
                  color: accent.primary,
                  fontSize: 13,
                }}
              >
                Forgot password?
              </Link>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={<LoginOutlined />}
                style={{
                  height: 48,
                  borderRadius: 8,
                  background: accent.gradient,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '24px 0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              OR CONTINUE WITH
            </Text>
          </Divider>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              block
              size="large"
              icon={<GithubOutlined />}
              style={{ borderRadius: 8, height: 44 }}
            >
              GitHub
            </Button>
            <Button
              block
              size="large"
              icon={<GoogleOutlined />}
              style={{ borderRadius: 8, height: 44 }}
            >
              Google
            </Button>
          </Space>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: accent.primary,
                fontWeight: 600,
              }}
            >
              Sign up
            </Link>
          </Text>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
