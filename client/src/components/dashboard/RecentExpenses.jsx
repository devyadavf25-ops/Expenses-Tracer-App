import { useState, useEffect } from 'react';
import { getExpenses } from '../../services/expenseService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateUtils';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';

const CATEGORY_ICONS = {
  'Food & Dining': '🍔',
  'Transportation': '🚗',
  'Housing & Rent': '🏠',
  'Shopping': '🛒',
  'Healthcare': '💊',
  'Education': '🎓',
  'Entertainment': '🎮',
  'Utilities & Bills': '💡',
  'Travel': '✈️',
  'Savings & Investments': '💰',
  'Other': '📦',
};

const RecentExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getExpenses({ limit: 5 });
        setExpenses(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Expenses</h3>
        <Link
          to="/expenses"
          className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1 no-underline"
        >
          View All <HiOutlineArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : expenses.length === 0 ? (
        <p className="text-dark-400 text-center py-8">No expenses yet. Start tracking!</p>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{CATEGORY_ICONS[expense.category] || '📦'}</span>
                <div>
                  <p className="text-white font-medium text-sm">{expense.title}</p>
                  <p className="text-dark-400 text-xs">{expense.category} • {formatDate(expense.date)}</p>
                </div>
              </div>
              <p className="text-white font-semibold text-sm">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentExpenses;
