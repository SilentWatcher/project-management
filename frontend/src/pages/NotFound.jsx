import { useNavigate } from 'react-router-dom';
import { Button, Typography, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectAccentPreset } from '../store/slices/uiSlice';

const { Title, Text } = Typography;

const NotFound = () => {
  const navigate = useNavigate();
  const accent = useSelector(selectAccentPreset);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: accent.gradient,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            opacity: 0.1,
          }}
        >
          <Title style={{ fontSize: 120, margin: 0, opacity: 0.5 }}>404</Title>
        </div>

        <Title level={1} style={{ marginBottom: 16 }}>
          <span className="gradient-text">Page Not Found</span>
        </Title>
        <Text type="secondary" style={{ fontSize: 18, display: 'block', marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved.
        </Text>

        <Space size="middle">
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{
              background: accent.gradient,
              border: 'none',
              borderRadius: 8,
              height: 48,
              padding: '0 32px',
            }}
          >
            Go Home
          </Button>
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ borderRadius: 8, height: 48, padding: '0 32px' }}
          >
            Go Back
          </Button>
        </Space>
      </motion.div>
    </div>
  );
};

export default NotFound;
