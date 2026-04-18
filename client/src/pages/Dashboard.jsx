import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExpenseStats } from '../services/expenseService';
import { formatCurrency } from '../utils/formatCurrency';
import { getMonthName } from '../utils/dateUtils';
import StatCard from '../components/dashboard/StatCard';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import LedgerSummaryWidget from '../components/dashboard/LedgerSummaryWidget';
import {
  HiOutlineCurrencyDollar, HiOutlineCalendar,
  HiOutlineTag, HiOutlineCollection, HiOutlineTrendingUp,
} from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await getExpenseStats();
      setStats(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
        <div className="page-spinner" />
      </div>
    );
  }

  const topCategory = stats?.byCategory?.[0]?._id || 'N/A';
  const monthlyData = (stats?.monthlyTrend || []).map(m => ({
    name: m._id?.month ? getMonthName(m._id.month) : 'N/A',
    amount: m.total || 0, count: m.count || 0,
  }));
  const categoryData = (stats?.byCategory || []).map(c => ({
    name: c._id || 'Other', value: parseFloat(c.total || 0), count: parseInt(c.count || 0),
  }));

  const budgetPct = user?.monthlyBudget > 0
    ? Math.min(100, ((stats?.thisMonth || 0) / user.monthlyBudget) * 100) : 0;
  const budgetOver = budgetPct > 90;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            Hello, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => window.location.href = '/ledger'}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 14,
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border)', color: 'var(--text-primary)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            📒 My Ledger
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-expense-modal'))}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 22px', borderRadius: 14,
              background: 'linear-gradient(135deg, #00c866, #00a855)',
              border: 'none', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px var(--accent-glow)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px var(--accent-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--accent-glow)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard title="Total Spent"       value={formatCurrency(stats?.total || 0)}          icon={HiOutlineCurrencyDollar} color="primary" />
        <StatCard title="This Month"        value={formatCurrency(stats?.thisMonth || 0)}       icon={HiOutlineCalendar}       color="info"    />
        <StatCard title="Top Category"      value={topCategory}                                 icon={HiOutlineTag}            color="warning" />
        <StatCard title="Total Entries"     value={stats?.totalCount || 0}                      icon={HiOutlineCollection}     color="success" />
        <StatCard title="Predicted Monthly" value={formatCurrency(stats?.predictedMonthly || 0)} icon={HiOutlineTrendingUp}    color="danger"  />
      </div>

      {/* ── Budget Bar (if set) ── */}
      {user?.monthlyBudget > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: `1px solid ${budgetOver ? 'rgba(248,113,113,0.25)' : 'var(--border)'}`,
          borderRadius: 18, padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Monthly Budget</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: budgetOver ? '#f87171' : 'var(--text-primary)', margin: 0 }}>
                {formatCurrency(stats?.thisMonth || 0)}
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8 }}>
                  of {formatCurrency(user.monthlyBudget)}
                </span>
              </p>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: 20,
              background: budgetOver ? 'rgba(248,113,113,0.1)' : 'var(--accent-dim)',
              color: budgetOver ? '#f87171' : 'var(--accent)',
              fontSize: 12, fontWeight: 700,
              border: `1px solid ${budgetOver ? 'rgba(248,113,113,0.2)' : 'var(--border-hover)'}`,
            }}>
              {budgetPct.toFixed(0)}% {budgetOver ? '⚠️ Over limit' : 'used'}
            </div>
          </div>
          <div style={{ height: 8, background: 'var(--bg-card-hover)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 10,
              width: `${budgetPct}%`,
              background: budgetOver
                ? 'linear-gradient(90deg, #ef4444, #f87171)'
                : 'linear-gradient(90deg, #00c866, #00e87a)',
              transition: 'width 1s ease',
              boxShadow: budgetOver ? '0 0 12px rgba(239,68,68,0.4)' : '0 0 12px var(--accent-glow)',
            }} />
          </div>
        </div>
      )}

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }} className="chart-grid">
        <style>{`@media(max-width:900px){.chart-grid{grid-template-columns:1fr !important;}}`}</style>
        <SpendingChart data={monthlyData} />
        <CategoryPieChart data={categoryData} />
      </div>

      {/* ── Ledger + Recent Expenses ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }} className="chart-grid">
        <RecentExpenses />
        <LedgerSummaryWidget />
      </div>
    </div>
  );
};

export default Dashboard;
