import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await API.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed or link expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>🔒</div>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Resetting...' : 'Update Password'}
          </button>
        </form>
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
  }
};

export default ResetPassword;
