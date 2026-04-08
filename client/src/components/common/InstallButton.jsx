import { useState, useEffect } from 'react';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('👍 BeforeInstallPromptEvent fired');
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      console.log('🎉 App installed successfully');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`👤 User Choice: ${outcome}`);
    
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div style={{
        padding: '12px 16px',
        borderRadius: 14,
        background: 'rgba(0,232,122,0.05)',
        border: '1px solid rgba(0,232,122,0.15)',
        color: '#00e87a',
        fontSize: 13,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e87a', boxShadow: '0 0 8px #00e87a' }} />
        App Installed & Ready
      </div>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        width: '100%',
        padding: '14px',
        borderRadius: 14,
        background: 'linear-gradient(135deg, #00c866, #00a855)',
        border: 'none',
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxShadow: '0 4px 20px rgba(0,232,122,0.3)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,232,122,0.45)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,232,122,0.3)'; }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download App
    </button>
  );
};

export default InstallButton;
