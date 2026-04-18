import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLedgerEntries } from '../../services/ledgerService';
import { useAuth } from '../../context/AuthContext';

const fmt = (n) => parseFloat(n || 0).toFixed(2);

const LedgerSummaryWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currency = user?.currency || 'NPR';
  const [summary, setSummary] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLedgerEntries({ status: 'pending' })
      .then(res => {
        setSummary(res.data.data.summary);
        setRecentEntries(res.data.data.entries.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
      <div className="page-spinner" />
    </div>
  );

  const netBalance = summary?.netBalance || 0;
  const netPositive = netBalance >= 0;

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            📒
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>My Ledger</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Pending balances</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/ledger')}
          style={{ padding: '6px 14px', borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--border-hover)', color: 'var(--accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          View All →
        </button>
      </div>

      {/* Mini Net Balance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'To Receive', value: summary?.pendingLent || 0, color: '#f87171' },
          { label: 'To Pay',     value: summary?.pendingBorrowed || 0, color: '#60a5fa' },
          { label: 'Net',        value: Math.abs(netBalance), color: netPositive ? '#34d399' : '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-card-hover)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color }}>{currency} {fmt(value)}</p>
          </div>
        ))}
      </div>

      {/* Recent pending entries */}
      {recentEntries.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentEntries.map(e => {
            const remaining = parseFloat(e.amount) - parseFloat(e.settledAmount || 0);
            const isOverdue = e.dueDate && new Date(e.dueDate) < new Date();
            return (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card-hover)', borderRadius: 10, borderLeft: `3px solid ${e.type === 'lent' ? '#f87171' : '#60a5fa'}` }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{e.personName}</p>
                  <p style={{ margin: 0, fontSize: 11, color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}>
                    {e.type === 'lent' ? '💸 You lent' : '🤝 You borrowed'}{isOverdue ? ' · ⚠️ Overdue' : ''}
                  </p>
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: e.type === 'lent' ? '#f87171' : '#60a5fa' }}>
                  {currency} {fmt(remaining)}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          🎉 No pending balances!
        </div>
      )}
    </div>
  );
};

export default LedgerSummaryWidget;
