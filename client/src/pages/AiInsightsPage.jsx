import { useState, useEffect } from 'react';
import { getAiInsights } from '../services/aiService';

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const BulbIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.45.62 2.84 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ICON_MAP = {
  warning: { icon: AlertIcon, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  tip: { icon: BulbIcon, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
  info: { icon: InfoIcon, color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)' },
  success: { icon: CheckIcon, color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' },
};

const AiInsightsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await getAiInsights();
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInsights(); }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
            AI Insights <span style={{ fontSize: 22 }}>✨</span>
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            Powered by GPT-4o-Mini
          </p>
        </div>
        <button onClick={fetchInsights} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 13,
          background: 'linear-gradient(135deg, #00c866, #00a855)',
          border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
          boxShadow: '0 4px 20px var(--accent-glow)',
        }}
          onMouseEnter={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { if(!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={loading ? "animate-spin" : ""}>
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 24, padding: '80px 20px', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        }}>
          <div className="page-spinner" style={{ margin: '0 auto 24px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} className="animate-pulse">
            AI is analyzing your spending patterns...
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {(data?.insights || []).map((ins, i) => {
            const config = ICON_MAP[ins.type] || ICON_MAP.info;
            const Icon = config.icon;
            return (
              <div key={i} className="animate-slide-in" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20, padding: 24,
                animationDelay: `${i * 100}ms`,
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = config.color;
                  e.currentTarget.style.boxShadow = `0 12px 36px ${config.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: config.bg, border: `1px solid ${config.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: config.color,
                  }}>
                    <Icon />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.3 }}>{ins.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{ins.description}</p>
                    <div style={{ marginTop: 14 }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 8,
                        background: config.bg, color: config.color,
                        fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                        border: `1px solid ${config.border}`,
                      }}>{ins.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {(!data?.insights || data.insights.length === 0) && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', border: '1px solid var(--border)', borderRadius: 20, background: 'var(--bg-card)' }}>
                <p style={{ fontSize: 32, margin: '0 0 10px' }}>🤖</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No insights found yet. Add more expenses to give your AI something to analyze.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiInsightsPage;
