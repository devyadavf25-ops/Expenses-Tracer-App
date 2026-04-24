import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>📧</div>
          <h1 style={styles.title}>Forgot Password</h1>
          <p style={styles.subtitle}>Enter your email to receive a reset link</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={styles.success}>
            <div style={styles.successIcon}>✅</div>
            <p>Check your email for the reset link. It will expire in 10 minutes.</p>
          </div>
        )}

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #030d1a 0%, #051224 55%, #071830 100%)',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 400,
    background: 'rgba(7, 21, 37, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 232, 122, 0.15)',
    borderRadius: 24,
    padding: 40,
    boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
  },
  header: { textAlign: 'center', marginBottom: 32 },
  iconCircle: {
    width: 60, height: 60, borderRadius: '50%',
    background: 'rgba(0, 232, 122, 0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24, margin: '0 auto 16px', border: '1px solid rgba(0, 232, 122, 0.2)'
  },
  title: { fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 8px' },
  subtitle: { fontSize: 14, color: '#888', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 12, fontWeight: 600, color: '#5a8a7a', textTransform: 'uppercase' },
  input: {
    height: 50, borderRadius: 12, border: '1px solid rgba(0, 232, 122, 0.2)',
    background: 'rgba(255,255,255,0.03)', color: '#fff', padding: '0 16px',
    outline: 'none', transition: 'all 0.3s'
  },
  btn: {
    height: 50, borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #00c866, #00a855)',
    color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s'
  },
  success: { textAlign: 'center', color: '#00e87a' },
  successIcon: { fontSize: 40, marginBottom: 16 },
  footer: { marginTop: 32, textAlign: 'center' },
  link: { color: '#00e87a', textDecoration: 'none', fontWeight: 600 }
};

export default ForgotPassword;
