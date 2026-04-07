import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#00e87a','#38bdf8','#f472b6','#fbbf24','#a78bfa','#fb923c','#34d399','#60a5fa','#f87171','#4ade80','#94a3b8'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>{payload[0].name}</p>
        <p style={{ fontSize: 15, fontWeight: 800, margin: 0, color: payload[0].payload.fill }}>
          NPR {payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ data }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20, padding: '24px',
    height: '100%', minHeight: 320,
  }}>
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Allocation</h3>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category Split</p>
    </div>

    {data.length === 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 220, gap: 12 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(0,232,122,0.2)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <p style={{ color: '#3a6a5a', fontSize: 13, textAlign: 'center' }}>Waiting for transaction data.</p>
      </div>
    ) : (
      <>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
              paddingAngle={4} dataKey="value" stroke="none" animationDuration={1000}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
          {data.map((item, i) => {
            const total = data.reduce((s, d) => s + d.value, 0);
            const pct = Math.round((item.value / total) * 100);
            const color = COLORS[i % COLORS.length];
            return (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {pct}% <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>· NPR {item.value?.toLocaleString()}</span>
                  </span>
                </div>
                <div style={{ height: 3, background: 'var(--accent-dim)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </>
    )}
  </div>
);

export default CategoryPieChart;
