const COLOR_MAP = {
  primary: { bg: 'rgba(0,232,122,0.08)', glow: 'rgba(0,232,122,0.15)', text: '#00e87a', border: 'rgba(0,232,122,0.2)' },
  info:    { bg: 'rgba(56,189,248,0.08)', glow: 'rgba(56,189,248,0.15)', text: '#38bdf8', border: 'rgba(56,189,248,0.2)' },
  warning: { bg: 'rgba(245,158,11,0.08)', glow: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
  success: { bg: 'rgba(74,222,128,0.08)', glow: 'rgba(74,222,128,0.15)', text: '#4ade80', border: 'rgba(74,222,128,0.2)' },
  danger:  { bg: 'rgba(248,113,113,0.08)', glow: 'rgba(248,113,113,0.15)', text: '#f87171', border: 'rgba(248,113,113,0.2)' },
};

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const c = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #0a1e30 0%, #071525 100%)',
        border: `1px solid ${c.border}`,
        borderRadius: 18,
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 12px 36px ${c.glow}`;
        e.currentTarget.style.borderColor = c.text;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = c.border;
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${c.text}, transparent)`,
        opacity: 0.6,
      }} />

      {/* Icon + Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#4a7a6a', margin: 0,
        }}>{title}</p>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: c.bg, border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} style={{ color: c.text }} />
        </div>
      </div>

      {/* Value */}
      <p style={{
        fontSize: 26, fontWeight: 800,
        color: '#d0f0e0', margin: 0,
        letterSpacing: '-0.5px',
        lineHeight: 1.1,
      }}>{value}</p>
    </div>
  );
};

export default StatCard;
