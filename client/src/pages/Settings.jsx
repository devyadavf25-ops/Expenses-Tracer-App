import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toInputDate } from '../utils/dateUtils';
import InstallButton from '../components/common/InstallButton';

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e87a" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const BudgetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const GoalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const Section = ({ icon, title, subtitle, children }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20, padding: '28px 28px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'var(--accent-dim)',
        border: '1px solid var(--border-hover)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px' }}>{title}</h2>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const FieldRow = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  background: 'var(--bg-card-hover)',
  border: '1.5px solid var(--border)',
  borderRadius: 12, padding: '0 16px',
  height: 48, color: 'var(--text-primary)',
  fontSize: 14, fontWeight: 500,
  outline: 'none', width: '100%',
  caretColor: 'var(--accent)',
  transition: 'all 0.2s',
};

const SaveBtn = ({ loading, text, loadingText, color = '#00c866' }) => (
  <button type="submit" disabled={loading} style={{
    padding: '0 28px', height: 48, borderRadius: 12,
    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
    border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    boxShadow: `0 4px 16px ${color}44`,
    transition: 'all 0.2s', flexShrink: 0,
  }}
    onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    {loading ? loadingText : text}
  </button>
);

const Settings = () => {
  const { user, updateUserSettings } = useAuth();
  const [budget, setBudget] = useState(user?.monthlyBudget || '');
  const [savingBudget, setSavingBudget] = useState(false);
  const [goalAmount, setGoalAmount] = useState(user?.savingsGoal?.targetAmount || '');
  const [goalDate, setGoalDate] = useState(user?.savingsGoal?.targetDate ? toInputDate(user.savingsGoal.targetDate) : '');
  const [savingGoal, setSavingGoal] = useState(false);

  const handleUpdateBudget = async (e) => {
    e.preventDefault(); setSavingBudget(true);
    await updateUserSettings({ monthlyBudget: Number(budget) });
    setSavingBudget(false);
  };
  const handleUpdateGoal = async (e) => {
    e.preventDefault(); setSavingGoal(true);
    await updateUserSettings({ savingsGoal: { ...user.savingsGoal, targetAmount: Number(goalAmount), targetDate: goalDate } });
    setSavingGoal(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Settings</h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Profile & Financial Preferences
        </p>
      </div>

      {/* Profile */}
      <Section icon={<UserIcon />} title="Profile" subtitle="Your account info">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="settings-grid">
          <style>{`@media(max-width:600px){.settings-grid{grid-template-columns:1fr !important}}`}</style>
          <FieldRow label="Full Name">
            <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', opacity: 0.6, cursor: 'not-allowed' }}>
              {user?.name}
            </div>
          </FieldRow>
          <FieldRow label="Email Address">
            <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', opacity: 0.6, cursor: 'not-allowed', overflow: 'hidden' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
            </div>
          </FieldRow>
        </div>
        <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 12 }}>
          🔒 Profile info cannot be changed. Contact support to update email.
        </p>
      </Section>

      {/* Budget */}
      <Section icon={<BudgetIcon />} title="Monthly Budget" subtitle="Spending limit per month">
        <form onSubmit={handleUpdateBudget}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <FieldRow label={`Budget Ceiling (${user?.currency || 'NPR'})`}>
              <input
                type="number" min="0" step="0.01"
                value={budget} onChange={e => setBudget(e.target.value)}
                placeholder="e.g. 50000" required
                style={{ ...inputStyle, width: 260 }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </FieldRow>
            <SaveBtn loading={savingBudget} text="Set Budget" loadingText="Saving..." color="#38bdf8" />
          </div>
          {user?.monthlyBudget > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
              Current budget: <strong style={{ color: '#38bdf8' }}>{user.currency} {user.monthlyBudget.toLocaleString()}</strong> / month
            </p>
          )}
        </form>
      </Section>

      {/* Savings Goal */}
      <Section icon={<GoalIcon />} title="Savings Goal" subtitle="Track a wealth target">
        <form onSubmit={handleUpdateGoal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="settings-grid">
            <FieldRow label={`Target Amount (${user?.currency || 'NPR'})`}>
              <input
                type="number" min="0" step="0.01"
                value={goalAmount} onChange={e => setGoalAmount(e.target.value)}
                placeholder="e.g. 100000" required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </FieldRow>
            <FieldRow label="Target Date">
              <input
                type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} required
                style={{ ...inputStyle }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </FieldRow>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SaveBtn loading={savingGoal} text="Save Goal" loadingText="Saving..." color="#a78bfa" />
          </div>
        </form>
      </Section>

      {/* App Installation */}
      <Section 
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>} 
        title="App Settings" 
        subtitle="Manage your application"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Download Expenses Tracer to your device for faster access and a better experience. Once installed, it will appear on your home screen.
          </p>
          <div style={{ maxWidth: 320 }}>
            <InstallButton />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Settings;
