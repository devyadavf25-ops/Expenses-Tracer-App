import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-light p-3">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-sm text-primary-400">NPR {payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const SpendingChart = ({ data }) => {
  return (
    <div className="glass p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Monthly Spending Trend</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-dark-400">
          No data yet. Add expenses to see trends.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SpendingChart;
