import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import Chatbot from '../ai/Chatbot';

const Layout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #030d1a 0%, #051224 55%, #071830 100%)',
      color: '#d0f0e0',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      position: 'relative',
    }}>
      {/* Background ambient glows */}
      <div style={{
        position: 'fixed', top: '-15%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,232,122,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-15%', left: '10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,80,200,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <Sidebar />

      <main style={{
        marginLeft: 260,
        padding: '28px 32px',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
        overflowX: 'hidden',
      }} className="main-content">
        <style>{`
          @media (max-width: 1024px) {
            .main-content { margin-left: 0 !important; padding: 80px 16px 24px !important; }
          }
        `}</style>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <Chatbot />
    </div>
  );
};

export default Layout;
