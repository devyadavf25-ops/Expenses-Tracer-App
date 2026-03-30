import { useState, useEffect } from 'react';
import { getExpenses, deleteExpense } from '../../services/expenseService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateUtils';
import ExpenseFormModal from '../../components/expenses/ExpenseFormModal';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineSearch, HiOutlineFilter,
} from 'react-icons/hi';

const CATEGORY_ICONS = {
  'Food & Dining': '🍔', 'Transportation': '🚗', 'Housing & Rent': '🏠',
  'Shopping': '🛒', 'Healthcare': '💊', 'Education': '🎓',
  'Entertainment': '🎮', 'Utilities & Bills': '💡', 'Travel': '✈️',
  'Savings & Investments': '💰', 'Other': '📦',
};

const CATEGORIES = ['All', 'Food & Dining', 'Transportation', 'Housing & Rent', 'Shopping', 'Healthcare', 'Education', 'Entertainment', 'Utilities & Bills', 'Travel', 'Savings & Investments', 'Other'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const res = await getExpenses(params);
      setExpenses(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
      fetchExpenses(pagination.page);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleModalClose = (saved) => {
    setShowModal(false);
    setEditingExpense(null);
    if (saved) fetchExpenses(pagination.page);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Expenses</h1>
          <p className="text-dark-400 text-sm">{pagination.total} total entries</p>
        </div>
        <button onClick={handleAdd} className="btn-gradient flex items-center gap-2">
          <HiOutlinePlus size={18} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="glass p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses..."
              className="input-dark pl-11"
            />
          </form>
          <div className="relative">
            <HiOutlineFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-dark pl-11 pr-4 appearance-none cursor-pointer min-w-[180px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expense List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-5xl mb-4">💸</p>
          <p className="text-xl text-white font-semibold mb-2">No expenses found</p>
          <p className="text-dark-400 mb-6">Start tracking your spending by adding your first expense</p>
          <button onClick={handleAdd} className="btn-gradient">Add Your First Expense</button>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense, idx) => (
            <div
              key={expense._id}
              className="glass p-4 flex items-center justify-between hover:border-primary-500/30 transition-all animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="text-2xl">{CATEGORY_ICONS[expense.category] || '📦'}</span>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{expense.title}</p>
                  <p className="text-dark-400 text-sm">
                    {expense.category} • {formatDate(expense.date)}
                    {expense.isAiCategorized && <span className="ml-2 text-primary-400 text-xs">🤖 AI</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-white font-bold text-lg whitespace-nowrap">{formatCurrency(expense.amount)}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 rounded-lg hover:bg-primary-500/10 text-dark-400 hover:text-primary-400 transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    <HiOutlinePencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="p-2 rounded-lg hover:bg-danger/10 text-dark-400 hover:text-danger transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchExpenses(page)}
              className={`w-10 h-10 rounded-xl border-0 cursor-pointer font-medium transition-all ${
                page === pagination.page
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800/50 text-dark-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ExpenseFormModal expense={editingExpense} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default Expenses;
