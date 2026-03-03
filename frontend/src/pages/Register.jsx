import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Steps,
  Alert,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { register, selectAuthLoading, selectAuthError, clearError, selectIsAuthenticated } from '../store/slices/authSlice';
import { selectAccentPreset } from '../store/slices/uiSlice';

const { Title, Text } = Typography;
const { Step } = Steps;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accent = useSelector(selectAccentPreset);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const nextStep = async () => {
    try {
      const fields = currentStep === 0 ? ['name', 'email'] : ['password', 'confirmPassword'];
      await form.validateFields(fields);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // Validation failed
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Get all form values
      const values = await form.validateFields();
      const { confirmPassword, ...userData } = values;
      
      const result = await dispatch(register(userData));
      if (register.fulfilled.match(result)) {
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (error) {
      // Form validation failed
      console.error('Form validation failed:', error);
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
        style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
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
            <span className="gradient-text">Create Account</span>
          </Title>
          <Text type="secondary">Join Zenkai and start managing projects</Text>
        </div>

        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: 'none',
          }}
          bodyStyle={{ padding: 40 }}
        >
          <Steps
            current={currentStep}
            size="small"
            style={{ marginBottom: 32 }}
            items={[
              { title: 'Account' },
              { title: 'Password' },
              { title: 'Complete' },
            ]}
          />

          <Form
            form={form}
            name="register"
            autoComplete="off"
            layout="vertical"
            preserve={true}
          >
            {/* Step 1: Account Info */}
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Please enter your name' },
                  { min: 2, message: 'Name must be at least 2 characters' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
                  placeholder="Full name"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
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
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </div>

            {/* Step 2: Password */}
            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
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
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
                  placeholder="Confirm password"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </div>

            {/* Step 3: Complete */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ textAlign: 'center', padding: '40px 0' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircleOutlined
                    style={{
                      fontSize: 80,
                      color: accent.primary,
                      marginBottom: 24,
                    }}
                  />
                </motion.div>
                <Title level={4}>Ready to create your account!</Title>
                <Text type="secondary">
                  Click the button below to complete registration
                </Text>
              </motion.div>
            )}

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                {currentStep > 0 && currentStep < 2 && (
                  <Button
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={prevStep}
                    style={{ borderRadius: 8 }}
                  >
                    Back
                  </Button>
                )}
                {currentStep < 2 && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={nextStep}
                    style={{
                      borderRadius: 8,
                      background: accent.gradient,
                      border: 'none',
                      marginLeft: 'auto',
                    }}
                  >
                    Next
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button
                    type="primary"
                    size="large"
                    loading={loading}
                    onClick={handleSubmit}
                    style={{
                      borderRadius: 8,
                      background: accent.gradient,
                      border: 'none',
                      width: '100%',
                      height: 48,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    Create Account
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: accent.primary,
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </Text>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
