import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0a1e30', border: '1px solid rgba(0,232,122,0.2)',
        borderRadius: 12, padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}>
        <p style={{ fontSize: 12, color: '#5a8a7a', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#00e87a', margin: 0 }}>
          NPR {payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SpendingChart = ({ data }) => (
  <div style={{
    background: 'linear-gradient(160deg, #0a1e30 0%, #071525 100%)',
    border: '1px solid rgba(0,232,122,0.12)',
    borderRadius: 20, padding: '24px 24px 16px',
    height: '100%', minHeight: 320,
  }}>
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#d0f0e0', margin: '0 0 4px' }}>Spending Flow</h3>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#3a6a5a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monthly Analytics</p>
    </div>

    {data.length === 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 12 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,232,122,0.2)" strokeWidth="1.5" strokeLinecap="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
        </svg>
        <p style={{ color: '#3a6a5a', fontSize: 13, textAlign: 'center' }}>No trend data yet. Add expenses to see your flow.</p>
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00e87a" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00e87a" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,232,122,0.06)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false}
            tick={{ fill: '#3a6a5a', fontSize: 10, fontWeight: 600 }} dy={10} />
          <YAxis axisLine={false} tickLine={false}
            tick={{ fill: '#3a6a5a', fontSize: 10, fontWeight: 600 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,232,122,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="amount" stroke="#00e87a" strokeWidth={2.5}
            fillOpacity={1} fill="url(#spendGrad)" animationDuration={1500} dot={{ fill: '#00e87a', r: 3, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default SpendingChart;
