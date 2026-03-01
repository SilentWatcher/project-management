import { Card, Typography, Empty, Avatar, List, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { selectAccentPreset } from '../store/slices/uiSlice';

const { Title, Text } = Typography;

const Team = () => {
  const user = useSelector(selectUser);
  const accent = useSelector(selectAccentPreset);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Team</Title>
        <Text type="secondary">Manage your team members and collaborators</Text>
      </div>

      <Card
        style={{
          borderRadius: 16,
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Empty
          description="Team management coming soon"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Text type="secondary">
            This feature is under development
          </Text>
        </Empty>
      </Card>
    </motion.div>
  );
};

export default Team;
