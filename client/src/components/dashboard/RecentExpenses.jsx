import { useState, useEffect } from 'react';
import { getExpenses } from '../../services/expenseService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateUtils';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  'Food & Dining': '🍔', 'Transportation': '🚗', 'Housing & Rent': '🏠',
  'Shopping': '🛒', 'Healthcare': '💊', 'Education': '🎓',
  'Entertainment': '🎮', 'Utilities & Bills': '💡', 'Travel': '✈️',
  'Savings & Investments': '💰', 'Other': '📦',
};

const CATEGORY_COLORS = {
  'Food & Dining': '#f87171', 'Transportation': '#60a5fa', 'Housing & Rent': '#fbbf24',
  'Shopping': '#f472b6', 'Healthcare': '#34d399', 'Education': '#818cf8',
  'Entertainment': '#fb923c', 'Utilities & Bills': '#38bdf8', 'Travel': '#a78bfa',
  'Savings & Investments': '#00e87a', 'Other': '#94a3b8',
};

const RecentExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getExpenses({ limit: 5 });
        setExpenses(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0a1e30 0%, #071525 100%)',
      border: '1px solid rgba(0,232,122,0.12)',
      borderRadius: 20, padding: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#d0f0e0', margin: '0 0 3px' }}>Recent Expenses</h3>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#3a6a5a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Latest Transactions</p>
        </div>
        <Link to="/expenses" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 10,
          background: 'rgba(0,232,122,0.06)',
          border: '1px solid rgba(0,232,122,0.15)',
          color: '#00e87a', fontSize: 11,
          fontWeight: 600, textDecoration: 'none',
          letterSpacing: '0.05em', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,232,122,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,232,122,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,232,122,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,232,122,0.15)'; }}
        >
          See All
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 160 }}>
          <div className="page-spinner" />
        </div>
      ) : expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>📭</p>
          <p style={{ color: '#3a6a5a', fontSize: 13 }}>No expenses recorded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {expenses.map((exp, idx) => {
            const catColor = CATEGORY_COLORS[exp.category] || '#94a3b8';
            return (
              <div key={exp.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 14,
                border: '1px solid transparent',
                transition: 'all 0.2s',
                animationDelay: `${idx * 60}ms`,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,232,122,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,232,122,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                {/* Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${catColor}15`,
                    border: `1px solid ${catColor}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {CATEGORY_ICONS[exp.category] || '📦'}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#c0e8d0', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{exp.title}</p>
                    <p style={{ fontSize: 11, color: '#3a6a5a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: catColor }}>{exp.category}</span>
                      <span>·</span>
                      <span>{formatDate(exp.date)}</span>
                    </p>
                  </div>
                </div>
                {/* Amount */}
                <p style={{ fontSize: 16, fontWeight: 800, color: '#00e87a', margin: 0, flexShrink: 0 }}>
                  {formatCurrency(exp.amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentExpenses;
