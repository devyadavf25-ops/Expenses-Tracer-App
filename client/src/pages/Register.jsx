import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Animated Lamp SVG (same as Login) ─────────────────────────────── */
const LampCharacter = ({ isLit }) => (
  <svg viewBox="0 0 220 320" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', maxWidth: 220, filter: isLit ? 'drop-shadow(0 0 24px #00ff9966)' : 'none', transition: 'filter 0.6s ease' }}>
    {isLit && <polygon points="60,140 160,140 200,320 20,320" fill="url(#lightFanR)" opacity="0.10" />}
    <path d="M55 70 L165 70 L148 138 L72 138 Z" fill="url(#shadeGradR)" />
    <rect x="52" y="64" width="116" height="12" rx="6" fill={isLit ? '#2ecc8a' : '#2a5c45'} />
    {isLit && <ellipse cx="110" cy="100" rx="18" ry="14" fill="#fffde0" opacity="0.55" />}
    {/* Excited / happy face */}
    <ellipse cx="92" cy="95" rx="7" ry={isLit ? 5 : 7} fill="#0a1a2e" style={{ transition: 'ry 0.4s ease' }} />
    <ellipse cx="128" cy="95" rx="7" ry={isLit ? 5 : 7} fill="#0a1a2e" style={{ transition: 'ry 0.4s ease' }} />
    {isLit && <>
      <ellipse cx="92" cy="92" rx="3" ry="2" fill="#fff" opacity="0.7" />
      <ellipse cx="128" cy="92" rx="3" ry="2" fill="#fff" opacity="0.7" />
    </>}
    <path d="M96 112 Q110 130 124 112" stroke="#0a1a2e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <ellipse cx="84" cy="112" rx="7" ry="4" fill="#ff9fb2" opacity="0.5" />
    <ellipse cx="136" cy="112" rx="7" ry="4" fill="#ff9fb2" opacity="0.5" />
    <rect x="106" y="138" width="8" height="80" rx="4" fill="#c0d8d0" />
    <ellipse cx="110" cy="220" rx="30" ry="8" fill="#8ab8a8" />
    <rect x="80" y="212" width="60" height="14" rx="7" fill="#8ab8a8" />
    <ellipse cx="110" cy="226" rx="40" ry="10" fill="#6a9a8a" />
    <path d="M110 218 Q95 240 100 260 Q105 275 92 278" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
    <text x="78" y="295" fontSize="18" fill="#aaa" opacity="0.7">☞</text>
    <defs>
      <linearGradient id="shadeGradR" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={isLit ? '#2ecc8a' : '#1e6e52'} />
        <stop offset="100%" stopColor={isLit ? '#1a8a5a' : '#0f4433'} />
      </linearGradient>
      <linearGradient id="lightFanR" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#fffaaa" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#fffaaa" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

/* ── Icons ──────────────────────────────────────────────────────────── */
const EyeIcon = ({ open }) => open ? (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const UserIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#00e87a' : '#4a6a7a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'stroke 0.3s' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const EmailIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#00e87a' : '#4a6a7a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'stroke 0.3s' }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#00e87a' : '#4a6a7a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'stroke 0.3s' }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* ── Password Strength Bar ──────────────────────────────────────────── */
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { score, label: 'Weak', color: '#ff4d4d' };
    if (score <= 3) return { score, label: 'Fair', color: '#ffa500' };
    return { score, label: 'Strong', color: '#00e87a' };
  };
  const { score, label, color } = getStrength();
  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? color : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color, marginTop: 4 }}>Password strength: {label}</p>
    </div>
  );
};


import API from '../services/api';

/* ── Main Component ─────────────────────────────────────────────────── */
const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [lampLit, setLampLit] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Check API Connection on load
  useEffect(() => {
    API.get('/health')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  useEffect(() => {
    setLampLit(nameFocus || emailFocus || passFocus);
  }, [nameFocus, emailFocus, passFocus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) navigate('/');
  };

  return (
    <div style={styles.root}>
      <div style={styles.bgGlow1} /><div style={styles.bgGlow2} />

      <div style={styles.container}>
        {/* LEFT — Lamp */}
        <div className="lg-visible" style={styles.leftPane}>
          <style>{`.lg-visible { display: flex; } @media (max-width: 860px) { .lg-visible { display: none !important; } }`}</style>
          <div style={{ ...styles.lampWrap, filter: lampLit ? 'brightness(1.15)' : 'brightness(0.85)' }}>
            <LampCharacter isLit={lampLit} />
          </div>
          <p style={styles.lampHint}>
            {lampLit ? '🎉 Let\'s set up your account!' : 'Hi! Fill the form to get started.'}
          </p>
        </div>

        {/* RIGHT — Card */}
        <div style={{ ...styles.card, boxShadow: lampLit ? styles.cardGlowActive.boxShadow : styles.card.boxShadow }}>
          <div style={styles.cardHeader}>
            <div style={styles.logoRing}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>Join SmartSpend — track smarter</p>
            
            {/* Status Indicator */}
            <div style={{ ...styles.statusBadge, color: apiStatus === 'online' ? '#00e87a' : apiStatus === 'offline' ? '#ff4d4d' : '#888' }}>
              <span style={{ ...styles.statusDot, background: apiStatus === 'online' ? '#00e87a' : apiStatus === 'offline' ? '#ff4d4d' : '#888' }} />
              API: {apiStatus === 'online' ? 'System Online' : apiStatus === 'offline' ? 'Server Offline/Timeout' : 'Verifying connection...'}
            </div>
          </div>


          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Full Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={{ ...styles.inputWrap, borderColor: nameFocus ? '#00e87a' : 'rgba(0,232,122,0.15)', boxShadow: nameFocus ? '0 0 0 3px rgba(0,232,122,0.12)' : 'none' }}>
                <span style={styles.inputIcon}><UserIcon active={nameFocus} /></span>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setNameFocus(true)}
                  onBlur={() => setNameFocus(false)}
                  placeholder="e.g. Dev Kumar"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={{ ...styles.inputWrap, borderColor: emailFocus ? '#00e87a' : 'rgba(0,232,122,0.15)', boxShadow: emailFocus ? '0 0 0 3px rgba(0,232,122,0.12)' : 'none' }}>
                <span style={styles.inputIcon}><EmailIcon active={emailFocus} /></span>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="name@example.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={{ ...styles.inputWrap, borderColor: passFocus ? '#00e87a' : 'rgba(0,232,122,0.15)', boxShadow: passFocus ? '0 0 0 3px rgba(0,232,122,0.12)' : 'none' }}>
                <span style={styles.inputIcon}><LockIcon active={passFocus} /></span>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  style={{ ...styles.input, letterSpacing: showPassword ? 'normal' : '0.15em' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Submit */}
            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,232,122,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,232,122,0.3)'; }}
            >
              {loading ? (
                <span style={styles.spinnerRow}>
                  <span style={styles.spinner} /> Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.footerLink}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ────────────────────────────────────────────────────────── */
const styles = {
  root: {
    minHeight: '100vh', width: '100%',
    background: 'var(--bg-gradient)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    position: 'relative', overflow: 'hidden', padding: '24px 16px',
    transition: 'background 0.5s ease',
  },
  bgGlow1: {
    position: 'absolute', top: '-20%', right: '-10%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute', bottom: '-15%', left: '-10%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,100,255,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 48, width: '100%', maxWidth: 860, zIndex: 1,
  },
  leftPane: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 16, flex: '0 0 220px',
  },
  lampWrap: { transition: 'filter 0.5s ease', width: 220 },
  lampHint: {
    color: 'var(--text-muted)', fontSize: 12, textAlign: 'center',
    fontStyle: 'italic', transition: 'color 0.4s', maxWidth: 180,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 24, padding: '36px 36px', width: '100%', maxWidth: 400,
    boxShadow: '0 0 40px rgba(0,0,0,0.2), 0 20px 60px rgba(0,0,0,0.5)',
    transition: 'all 0.4s ease',
  },
  cardGlowActive: {
    boxShadow: '0 0 60px var(--accent-glow), 0 0 120px rgba(0,232,122,0.08), 0 20px 60px rgba(0,0,0,0.5)',
  },
  cardHeader: { textAlign: 'center', marginBottom: 28 },
  logoRing: {
    width: 56, height: 56, borderRadius: 16,
    border: '1.5px solid var(--border-hover)',
    background: 'var(--accent-dim)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px', boxShadow: '0 0 20px var(--accent-glow)',
  },
  title: { fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: 13, color: 'var(--text-secondary)', margin: 0 },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600,
    padding: '6px 12px', borderRadius: 50, background: 'rgba(0,0,0,0.1)', marginTop: 12,
    border: '1px solid var(--border)',
  },
  statusDot: { width: 6, height: 6, borderRadius: '50%', boxShadow: '0 0 8px currentColor' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  inputWrap: {
    display: 'flex', alignItems: 'center',
    background: 'var(--bg-card-hover)',
    border: '1.5px solid var(--border)',
    borderRadius: 12, padding: '0 14px', height: 50,
    transition: 'all 0.25s ease', gap: 10,
  },
  inputIcon: { flexShrink: 0, display: 'flex', alignItems: 'center' },
  input: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, caretColor: 'var(--accent)',
  },
  eyeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
    padding: 4, borderRadius: 6, transition: 'color 0.2s',
  },
  submitBtn: {
    width: '100%', height: 50,
    background: 'linear-gradient(135deg, #00c866, #00a855)',
    border: 'none', borderRadius: 12, color: '#fff',
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    letterSpacing: '0.04em', boxShadow: '0 4px 20px rgba(0,232,122,0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s', marginTop: 4,
  },
  spinnerRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  spinner: {
    width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block',
  },
  footerText: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' },
  footerLink: { color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 },
};

export default Register;
