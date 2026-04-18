import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/* ── Icons ──────────────────────────────────────────────────────────── */
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const ExpenseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const LedgerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const AIIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Main navigation items
const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', Icon: HomeIcon },
  { path: '/expenses', label: 'Expenses', Icon: ExpenseIcon },
  { path: '/ledger', label: 'Ledger', Icon: LedgerIcon },
  { path: '/ai-insights', label: 'AI Insights', Icon: AIIcon },
  { path: '/settings', label: 'Settings', Icon: SettingsIcon },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoArea} onClick={() => { navigate('/'); setMobileOpen(false); }}>
        <div style={styles.logoIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <p style={styles.logoName}>SmartSpend</p>
          <p style={styles.logoSub}>AI Finance</p>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Nav */}
      <nav style={styles.nav}>
        <p style={styles.navSection}>NAVIGATION</p>
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              <span style={{ ...styles.navIcon, ...(isActive ? styles.navIconActive : {}) }}>
                <Icon />
              </span>
              <span style={styles.navLabel}>{label}</span>
              {isActive && <span style={styles.activeDot} />}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Theme Toggle */}
      <div style={{ padding: '0 16px 12px' }}>
        <button
          onClick={toggleTheme}
          style={styles.themeToggle}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{ ...styles.themeThumb, transform: isDark ? 'translateX(0)' : 'translateX(100%)' }}>
            {isDark ? <MoonIcon /> : <SunIcon />}
          </div>
          <span style={{ position: 'absolute', left: 12, opacity: isDark ? 1 : 0.3, transition: '0.3s' }}><MoonIcon /></span>
          <span style={{ position: 'absolute', right: 12, opacity: isDark ? 0.3 : 1, transition: '0.3s' }}><SunIcon /></span>
        </button>
      </div>

      {/* Quick Add Button */}
      <div style={{ padding: '0 16px 16px' }}>
        <button
          onClick={() => { window.dispatchEvent(new CustomEvent('open-expense-modal')); setMobileOpen(false); }}
          style={styles.addBtn}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px var(--accent-shadow)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-shadow)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Transaction
        </button>
      </div>

      {/* User */}
      <div style={styles.divider} />
      <div style={styles.userArea}>
        <div style={styles.userAvatar}>
          <UserIcon />
        </div>
        <div style={styles.userInfo}>
          <p style={styles.userName}>{user?.name}</p>
          <p style={styles.userEmail}>{user?.email}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        style={styles.logoutBtn}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'transparent'; }}
      >
        <LogoutIcon />
        <span>Sign Out</span>
      </button>
    </aside>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={styles.mobileToggle}
        className="lg-hidden"
      >
        <style>{`.lg-hidden { display: none; } @media (max-width: 1024px) { .lg-hidden { display: flex !important; } }`}</style>
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={styles.overlay}
        />
      )}

      {/* Desktop Sidebar */}
      <div style={styles.sidebarDesktop} className="sidebar-desktop">
        <style>{`
          .sidebar-desktop { display: block; }
          @media (max-width: 1024px) {
            .sidebar-desktop { display: none !important; }
          }
        `}</style>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div style={styles.sidebarMobile}>
          <SidebarContent />
        </div>
      )}
    </>
  );
};

/* ── Styles ─────────────────────────────────────────────────────────── */
const styles = {
  sidebar: {
    width: 260, height: '100vh',
    display: 'flex', flexDirection: 'column',
    background: 'linear-gradient(180deg, #060f1c 0%, #04101e 100%)',
    borderRight: '1px solid rgba(0,232,122,0.1)',
    overflowY: 'auto', overflowX: 'hidden',
    paddingBottom: 8,
  },
  sidebarDesktop: {
    position: 'fixed', top: 0, left: 0, zIndex: 50,
    height: '100vh',
  },
  sidebarMobile: {
    position: 'fixed', top: 0, left: 0, zIndex: 60,
    height: '100vh', boxShadow: '8px 0 40px rgba(0,0,0,0.7)',
  },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 55,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  },
  mobileToggle: {
    position: 'fixed', top: 16, left: 16, zIndex: 70,
    width: 44, height: 44, borderRadius: 12,
    background: 'rgba(0,232,122,0.1)',
    border: '1px solid rgba(0,232,122,0.2)',
    color: '#00e87a', cursor: 'pointer',
    alignItems: 'center', justifyContent: 'center',
  },
  logoArea: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '28px 20px 20px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: 42, height: 42, borderRadius: 12,
    background: 'rgba(0,232,122,0.1)',
    border: '1px solid rgba(0,232,122,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoName: {
    fontSize: 16, fontWeight: 800,
    color: '#d0f0e0', margin: 0,
    letterSpacing: '-0.3px',
  },
  logoSub: {
    fontSize: 10, fontWeight: 600,
    color: '#00e87a', margin: 0,
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(0,232,122,0.12), transparent)',
    margin: '4px 16px',
  },
  nav: {
    display: 'flex', flexDirection: 'column',
    padding: '12px 12px 8px', gap: 2,
  },
  navSection: {
    fontSize: 10, fontWeight: 700,
    color: '#3a6a5a', letterSpacing: '0.12em',
    padding: '8px 12px 6px',
    margin: 0,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px',
    borderRadius: 12,
    textDecoration: 'none',
    color: '#5a8a7a',
    fontSize: 13, fontWeight: 600,
    transition: 'all 0.2s ease',
    background: 'transparent',
    border: 'none',
    position: 'relative',
  },
  navItemActive: {
    background: 'rgba(0,232,122,0.1)',
    color: '#00e87a',
    border: '1px solid rgba(0,232,122,0.2)',
  },
  navIcon: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, opacity: 0.7,
    transition: 'opacity 0.2s',
  },
  navIconActive: { opacity: 1 },
  navLabel: { flex: 1 },
  activeDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#00e87a',
    boxShadow: '0 0 8px rgba(0,232,122,0.6)',
  },
  addBtn: {
    width: '100%', height: 44,
    background: 'linear-gradient(135deg, #00c866, #00a855)',
    border: 'none', borderRadius: 12,
    color: '#fff', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 16px var(--accent-glow)',
    transition: 'all 0.2s ease',
  },
  themeToggle: {
    width: '100%', height: 44,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    padding: '0 4px',
    transition: 'all 0.3s ease',
    color: 'var(--text-secondary)',
  },
  themeThumb: {
    width: '50%', height: 34,
    background: 'var(--accent-dim)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--accent)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  userArea: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px 4px',
  },
  userAvatar: {
    width: 36, height: 36, borderRadius: 10,
    background: 'rgba(0,232,122,0.08)',
    border: '1px solid rgba(0,232,122,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#00e87a', flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: 13, fontWeight: 700, color: '#b0d8c8',
    margin: 0, overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: 10, color: '#3a6a5a',
    margin: 0, overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '10px 16px',
    background: 'transparent', border: '1px solid transparent',
    borderRadius: 10,
    color: '#5a8a7a', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s ease',
    margin: '4px 0 8px',
  },
};

export default Sidebar;
