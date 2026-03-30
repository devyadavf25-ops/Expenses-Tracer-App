import { useState } from 'react';
import { createExpense, updateExpense } from '../../services/expenseService';
import { aiCategorize } from '../../services/aiService';
import { toInputDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlineSparkles } from 'react-icons/hi';

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Housing & Rent', 'Shopping',
  'Healthcare', 'Education', 'Entertainment', 'Utilities & Bills',
  'Travel', 'Savings & Investments', 'Other',
];

const ExpenseFormModal = ({ expense, onClose }) => {
  const isEditing = !!expense;
  const [title, setTitle] = useState(expense?.title || '');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [description, setDescription] = useState(expense?.description || '');
  const [category, setCategory] = useState(expense?.category || 'Other');
  const [date, setDate] = useState(toInputDate(expense?.date || new Date()));
  const [notes, setNotes] = useState(expense?.notes || '');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAiCategorized, setIsAiCategorized] = useState(expense?.isAiCategorized || false);

  const handleAiCategorize = async () => {
    if (!title || !amount) {
      toast.error('Enter title and amount first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiCategorize({ title, amount: parseFloat(amount) });
      const data = res.data.data;
      if (data.category) {
        setCategory(data.category);
        setIsAiCategorized(true);
        toast.success(`AI suggests: ${data.category} (${Math.round((data.confidence || 0) * 100)}% confident)`);
      }
    } catch {
      toast.error('AI categorization failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        title,
        amount: parseFloat(amount),
        description,
        category,
        date,
        notes,
        isAiCategorized,
      };
      if (isEditing) {
        const result = await updateExpense(expense._id, data);
        toast.success('Expense updated');
        if (result.data?.warning) {
          toast.error(result.data.warning, { duration: 5000 });
        }
      } else {
        const result = await createExpense(data);
        toast.success('Expense added');
        if (result.data?.warning) {
          toast.error(result.data.warning, { duration: 5000 });
        }
      }
      onClose(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-2 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Expense Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery shopping at Bhatbhateni"
              className="input-dark"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Amount (NPR) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-dark"
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly grocery for family"
              className="input-dark"
            />
          </div>

          {/* Category + AI button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-dark-300">Category</label>
              <button
                type="button"
                onClick={handleAiCategorize}
                disabled={aiLoading}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 transition-colors border border-primary-500/30 cursor-pointer disabled:opacity-50"
              >
                <HiOutlineSparkles size={14} />
                {aiLoading ? 'Analyzing...' : 'AI Categorize'}
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setIsAiCategorized(false); }}
              className="input-dark appearance-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-dark"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              className="input-dark min-h-[80px] resize-y"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 py-3 rounded-xl border border-dark-600 text-dark-300 hover:bg-white/5 transition-colors cursor-pointer bg-transparent font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient flex-1 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
