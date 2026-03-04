import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import CreateWorkspaceModal from '../modals/CreateWorkspaceModal';
import { selectSidebarCollapsed, selectModals, selectBackground, selectBackgroundPreset, selectAccentPreset } from '../../store/slices/uiSlice';

const { Content } = Layout;

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const modals = useSelector(selectModals);
  const background = useSelector(selectBackground);
  const backgroundPreset = useSelector(selectBackgroundPreset);
  const accent = useSelector(selectAccentPreset);

  // Get background styles
  const getBackgroundStyle = () => {
    if (!backgroundPreset || backgroundPreset.type === 'none') {
      return {};
    }
    
    if (backgroundPreset.type === 'gradient') {
      return {
        background: backgroundPreset.value,
        opacity: background.opacity,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: -1,
      };
    }
    
    if (backgroundPreset.type === 'pattern') {
      return {
        background: `${accent.gradient}`,
        opacity: background.opacity,
        backgroundImage: backgroundPreset.value,
        backgroundSize: backgroundPreset.size || '20px 20px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: -1,
      };
    }
    
    return {};
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Background Layer */}
      <div style={getBackgroundStyle()} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          mobile={false}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden"
            >
              <Sidebar
                collapsed={false}
                mobile={true}
                onClose={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Layout
        style={{
          marginLeft: sidebarCollapsed ? 60 : 260,
          transition: 'margin-left 0.2s ease',
          background: '#ffffff',
          minHeight: '100vh',
        }}
        className="lg:ml-0"
      >
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <Content
          style={{
            margin: 0,
            padding: 0,
            minHeight: 'calc(100vh - 52px)',
          }}
          className="animate-fade-in"
        >
          <Outlet />
        </Content>
      </Layout>

      {/* Modals */}
      <CreateWorkspaceModal 
        open={modals.workspaceCreate} 
        onClose={() => dispatch({ type: 'ui/closeModal', payload: { modal: 'workspaceCreate' } })}
      />
    </Layout>
  );
};

export default AppLayout;
