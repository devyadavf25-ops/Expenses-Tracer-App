import { useState, useEffect } from 'react';
import { getExpenses, deleteExpense } from '../services/expenseService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateUtils';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  'Food & Dining': '🍔', 'Transportation': '🚗', 'Housing & Rent': '🏠',
  'Shopping': '🛒', 'Healthcare': '💊', 'Education': '🎓',
  'Entertainment': '🎮', 'Utilities & Bills': '💡', 'Travel': '✈️',
  'Savings & Investments': '💰', 'Other': '📦',
};

const CATEGORY_COLORS = {
  'Food & Dining':'#f87171','Transportation':'#60a5fa','Housing & Rent':'#fbbf24',
  'Shopping':'#f472b6','Healthcare':'#34d399','Education':'#818cf8',
  'Entertainment':'#fb923c','Utilities & Bills':'#38bdf8','Travel':'#a78bfa',
  'Savings & Investments':'#00e87a','Other':'#94a3b8',
};

const CATEGORIES = ['All','Food & Dining','Transportation','Housing & Rent','Shopping','Healthcare','Education','Entertainment','Utilities & Bills','Travel','Savings & Investments','Other'];

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

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
    } catch { toast.error('Failed to fetch expenses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExpenses(); }, [category]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await deleteExpense(id); toast.success('Expense deleted'); fetchExpenses(pagination.page); }
    catch { toast.error('Failed to delete'); }
  };

  const handleModalClose = (saved) => {
    setShowModal(false); setEditingExpense(null);
    if (saved) fetchExpenses(pagination.page);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#d0f0e0', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Expenses</h1>
          <p style={{ fontSize: 11, color: '#3a6a5a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            {pagination.total} transactions recorded
          </p>
        </div>
        <button
          onClick={() => { setEditingExpense(null); setShowModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 13,
            background: 'linear-gradient(135deg, #00c866, #00a855)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,232,122,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,232,122,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,232,122,0.3)'; }}
        >
          <PlusIcon /> Add Entry
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: 'linear-gradient(160deg, #0a1e30 0%, #071525 100%)',
        border: '1px solid rgba(0,232,122,0.12)',
        borderRadius: 16, padding: '14px 16px',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search */}
        <form onSubmit={e => { e.preventDefault(); fetchExpenses(); }}
          style={{ flex: 1, minWidth: 200, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 14, color: '#3a6a5a', display: 'flex' }}><SearchIcon /></span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search expenses..."
            style={{
              width: '100%', height: 44,
              background: 'rgba(0,232,122,0.04)',
              border: '1px solid rgba(0,232,122,0.12)',
              borderRadius: 11, paddingLeft: 44, paddingRight: 14,
              color: '#d0f0e0', fontSize: 13, fontWeight: 500,
              outline: 'none', caretColor: '#00e87a',
              transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = '#00e87a'; e.target.style.boxShadow = '0 0 0 3px rgba(0,232,122,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(0,232,122,0.12)'; e.target.style.boxShadow = 'none'; }}
          />
        </form>

        {/* Category Filter */}
        <div style={{ position: 'relative', minWidth: 180 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#3a6a5a', display: 'flex', pointerEvents: 'none' }}><FilterIcon /></span>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{
              height: 44, width: '100%',
              background: 'rgba(0,232,122,0.04)',
              border: '1px solid rgba(0,232,122,0.12)',
              borderRadius: 11, paddingLeft: 38, paddingRight: 32,
              color: '#d0f0e0', fontSize: 12, fontWeight: 600,
              outline: 'none', cursor: 'pointer',
              appearance: 'none',
            }}>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0a1e30' }}>{c}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#3a6a5a', pointerEvents: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
          <div className="page-spinner" />
        </div>
      ) : expenses.length === 0 ? (
        <div style={{
          background: 'linear-gradient(160deg, #0a1e30 0%, #071525 100%)',
          border: '1px solid rgba(0,232,122,0.12)',
          borderRadius: 20, padding: '60px 24px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📭</p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#d0f0e0', margin: '0 0 8px' }}>No expenses found</h2>
          <p style={{ color: '#3a6a5a', fontSize: 13, marginBottom: 24 }}>Try different filters or add a new transaction.</p>
          <button
            onClick={() => { setEditingExpense(null); setShowModal(true); }}
            style={{
              padding: '12px 28px', borderRadius: 12,
              background: 'linear-gradient(135deg, #00c866, #00a855)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
            }}
          >Add Transaction</button>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(160deg, #0a1e30 0%, #071525 100%)',
          border: '1px solid rgba(0,232,122,0.12)',
          borderRadius: 20, overflow: 'hidden',
        }}>
          {expenses.map((exp, idx) => {
            const catColor = CATEGORY_COLORS[exp.category] || '#94a3b8';
            return (
              <div key={exp.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: idx < expenses.length - 1 ? '1px solid rgba(0,232,122,0.05)' : 'none',
                  transition: 'background 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,232,122,0.03)'; e.currentTarget.querySelector('.row-actions').style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.querySelector('.row-actions').style.opacity = '0'; }}
              >
                {/* Left: icon + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: `${catColor}15`, border: `1px solid ${catColor}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {CATEGORY_ICONS[exp.category] || '📦'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#c0e8d0', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.title}</p>
                    <p style={{ fontSize: 11, color: '#3a6a5a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: catColor }}>{exp.category}</span>
                      <span>·</span>
                      <span>{formatDate(exp.date)}</span>
                      {exp.isAiCategorized && (
                        <span style={{
                          padding: '1px 7px', borderRadius: 20,
                          background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.2)',
                          color: '#00e87a', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                        }}>AI</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: amount + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#00e87a', margin: 0 }}>{formatCurrency(exp.amount)}</p>
                  <style>{`
                    .row-actions-${exp.id} { opacity: 0; transition: opacity 0.2s; display: flex; gap: 6px; }
                    @media (max-width: 768px) { .row-actions-${exp.id} { opacity: 1 !important; } }
                  `}</style>
                  <div className={`row-actions row-actions-${exp.id}`}>
                    <button onClick={() => { setEditingExpense(exp); setShowModal(true); }}
                      style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
                        color: '#38bdf8', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; }}
                      title="Edit"
                    ><EditIcon /></button>
                    <button onClick={() => handleDelete(exp.id)}
                      style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                        color: '#f87171', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                      title="Delete"
                    ><TrashIcon /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchExpenses(p)}
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: p === pagination.page ? 'none' : '1px solid rgba(0,232,122,0.15)',
                background: p === pagination.page ? 'linear-gradient(135deg,#00c866,#00a855)' : 'transparent',
                color: p === pagination.page ? '#fff' : '#5a8a7a',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >{p}</button>
          ))}
        </div>
      )}

      {showModal && <ExpenseFormModal expense={editingExpense} onClose={handleModalClose} />}
    </div>
  );
};

export default Expenses;
