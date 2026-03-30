const COLOR_MAP = {
  primary: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
  info: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  danger: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
};

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div className="glass p-5 hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-dark-400 font-medium">{title}</p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <Icon size={20} style={{ color: colors.text }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white truncate">{value}</p>
    </div>
  );
};

export default StatCard;
