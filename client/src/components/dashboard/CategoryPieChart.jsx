import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb923c', '#34d399', '#60a5fa', '#fbbf24', '#94a3b8'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-light p-3">
        <p className="text-sm font-medium text-white">{payload[0].name}</p>
        <p className="text-sm" style={{ color: payload[0].payload.fill }}>
          NPR {payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ data }) => {
  return (
    <div className="glass p-6 h-full">
      <h3 className="text-lg font-semibold text-white mb-4">By Category</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-dark-400 text-sm">
          No data yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
            {data.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-dark-300 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="text-white font-medium">NPR {item.value?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryPieChart;
