import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Switch,
  Space,
  Divider,
  Avatar,
  Row,
  Col,
  Slider,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  MoonOutlined,
  SunOutlined,
  SaveOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  toggleTheme,
  selectTheme,
  selectAccentPreset,
  ACCENT_PRESETS,
  setAccentColor,
  setBackground,
  selectBackground,
  BACKGROUND_PRESETS,
} from '../store/slices/uiSlice';
import { selectUser } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isDark = useSelector(selectTheme);
  const accent = useSelector(selectAccentPreset);
  const background = useSelector(selectBackground);
  const [form] = Form.useForm();

  const handleBackgroundChange = (preset) => {
    dispatch(setBackground({ ...background, preset }));
  };

  const handleOpacityChange = (opacity) => {
    dispatch(setBackground({ ...background, opacity }));
  };

  const handleSaveProfile = (values) => {
    toast.success('Profile updated successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Settings</Title>
        <Text type="secondary">Manage your account and preferences</Text>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Profile Settings */}
        <Card
          title="Profile"
          style={{
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar
              size={100}
              style={{
                background: accent.gradient,
                fontSize: 40,
                fontWeight: 'bold',
                marginBottom: 16,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Title level={4} style={{ margin: 0 }}>{user?.name}</Title>
            <Text type="secondary">{user?.email}</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              name: user?.name,
              email: user?.email,
            }}
            onFinish={handleSaveProfile}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Full name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email address" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                style={{
                  background: accent.gradient,
                  border: 'none',
                }}
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Appearance Settings */}
        <Card
          title="Appearance"
          style={{
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Dark Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                {isDark ? <MoonOutlined /> : <SunOutlined />}
                <div>
                  <Text strong>Dark Mode</Text>
                  <br />
                  <Text type="secondary">Toggle between light and dark theme</Text>
                </div>
              </Space>
              <Switch
                checked={isDark}
                onChange={() => dispatch(toggleTheme())}
                checkedChildren="Dark"
                unCheckedChildren="Light"
              />
            </div>

            <Divider />

            {/* Accent Color Selection */}
            <div>
              <Text strong>Accent Color</Text>
              <br />
              <Text type="secondary">Choose your preferred color theme</Text>
              <div style={{ marginTop: 16 }}>
                <Space size="middle" wrap>
                  {Object.entries(ACCENT_PRESETS).map(([key, preset]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => dispatch(setAccentColor(key))}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: preset.gradient,
                        cursor: 'pointer',
                        border: accent.primary === preset.primary
                          ? '3px solid var(--text-primary)'
                          : '3px solid transparent',
                        boxShadow: accent.primary === preset.primary
                          ? '0 4px 12px rgba(0,0,0,0.2)'
                          : 'none',
                      }}
                      title={preset.name}
                    />
                  ))}
                </Space>
              </div>
            </div>

            <Divider />

            {/* Background Selection */}
            <div>
              <Space>
                <BgColorsOutlined />
                <div>
                  <Text strong>Background</Text>
                  <br />
                  <Text type="secondary">Choose a background style</Text>
                </div>
              </Space>
              <div style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                  {Object.entries(BACKGROUND_PRESETS).map(([key, preset]) => (
                    <Col xs={12} sm={8} md={6} key={key}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBackgroundChange(key)}
                        style={{
                          height: 60,
                          borderRadius: 8,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          border: background.preset === key
                            ? '3px solid var(--text-primary)'
                            : '3px solid transparent',
                          position: 'relative',
                        }}
                        title={preset.name}
                      >
                        {preset.type === 'none' ? (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Text>None</Text>
                          </div>
                        ) : preset.type === 'gradient' ? (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: preset.value,
                          }} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: accent.gradient,
                            backgroundSize: preset.size || '20px 20px',
                            backgroundImage: preset.value,
                          }} />
                        )}
                      </motion.div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {preset.name}
                      </Text>
                    </Col>
                  ))}
                </Row>
              </div>
              
              {background.preset !== 'none' && (
                <div style={{ marginTop: 16 }}>
                  <Text>Background Opacity: {Math.round(background.opacity * 100)}%</Text>
                  <Slider
                    min={0.01}
                    max={0.3}
                    step={0.01}
                    value={background.opacity}
                    onChange={handleOpacityChange}
                  />
                </div>
              )}
            </div>
          </Space>
        </Card>
      </Space>
    </motion.div>
  );
};

export default Settings;
