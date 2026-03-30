import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getExpenseStats } from '../../services/expenseService';
import { formatCurrency } from '../../utils/formatCurrency';
import { getMonthName } from '../../utils/dateUtils';
import StatCard from '../../components/dashboard/StatCard';
import SpendingChart from '../../components/dashboard/SpendingChart';
import CategoryPieChart from '../../components/dashboard/CategoryPieChart';
import RecentExpenses from '../../components/dashboard/RecentExpenses';
import GoalCard from '../../components/dashboard/GoalCard';
import { HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineTag, HiOutlineCollection, HiOutlineTrendingUp } from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getExpenseStats();
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const topCategory = stats?.byCategory?.[0]?._id || 'N/A';
  const monthlyData = (stats?.monthlyTrend || []).map((m) => ({
    name: getMonthName(m._id.month),
    amount: m.total,
    count: m.count,
  }));

  const categoryData = (stats?.byCategory || []).map((c) => ({
    name: c._id,
    value: c.total,
    count: c.count,
  }));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-dark-400">Here's your spending overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Spent"
          value={formatCurrency(stats?.total || 0)}
          icon={HiOutlineCurrencyDollar}
          color="primary"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats?.thisMonth || 0)}
          icon={HiOutlineCalendar}
          color="info"
        />
        <StatCard
          title="Top Category"
          value={topCategory}
          icon={HiOutlineTag}
          color="warning"
        />
        <StatCard
          title="Total Entries"
          value={stats?.totalCount || 0}
          icon={HiOutlineCollection}
          color="success"
        />
        <StatCard
          title="Predicted Monthly"
          value={formatCurrency(stats?.predictedMonthly || 0)}
          icon={HiOutlineTrendingUp}
          color="danger"
        />
      </div>

      {/* Goal Section (if set) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {(user?.savingsGoal?.targetAmount > 0 || user?.monthlyBudget > 0) && (
          <>
            {user?.savingsGoal?.targetAmount > 0 && (
              <GoalCard 
                title="Savings Goal"
                target={user.savingsGoal.targetAmount}
                current={user.savingsGoal.currentSaved}
                targetDate={user.savingsGoal.targetDate}
                onEdit={() => console.log('Edit Goal clicked - connect to settings modal later')}
              />
            )}
            
            {user?.monthlyBudget > 0 && (
              <div className="glass rounded-2xl p-6 relative">
                 <h3 className="text-sm font-medium text-dark-400 mb-4">Budget Limit</h3>
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold text-white">{formatCurrency(stats?.thisMonth || 0)}</span>
                    <span className="text-sm text-dark-300">of {formatCurrency(user.monthlyBudget)}</span>
                 </div>
                 <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        ((stats?.thisMonth || 0) / user.monthlyBudget) * 100 > 90 ? 'bg-danger-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${Math.min(100, ((stats?.thisMonth || 0) / user.monthlyBudget) * 100)}%` }}
                    ></div>
                 </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SpendingChart data={monthlyData} />
        </div>
        <div>
          <CategoryPieChart data={categoryData} />
        </div>
      </div>

      {/* Recent Expenses */}
      <RecentExpenses />
    </div>
  );
};

export default Dashboard;
