import { useState } from 'react';
import { createExpense, updateExpense } from '../../services/expenseService';
import { aiCategorize } from '../../services/aiService';
import { toInputDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Housing & Rent', 'Shopping',
  'Healthcare', 'Education', 'Entertainment', 'Utilities & Bills',
  'Travel', 'Savings & Investments', 'Other',
];

const inp = {
  background: 'rgba(0,232,122,0.04)',
  border: '1.5px solid rgba(0,232,122,0.12)',
  borderRadius: 12, height: 48,
  padding: '0 14px', color: '#d0f0e0',
  fontSize: 14, fontWeight: 500,
  outline: 'none', width: '100%',
  caretColor: '#00e87a', transition: 'all 0.2s',
};
const focusStyle = (e) => { e.target.style.borderColor = '#00e87a'; e.target.style.boxShadow = '0 0 0 3px rgba(0,232,122,0.1)'; };
const blurStyle = (e) => { e.target.style.borderColor = 'rgba(0,232,122,0.12)'; e.target.style.boxShadow = 'none'; };

const Label = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: '#3a6a5a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
    {children}
  </label>
);
const Field = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>{children}</div>
);

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
    if (!title || !amount) { toast.error('Enter title and amount first'); return; }
    setAiLoading(true);
    try {
      const res = await aiCategorize({ title, amount: parseFloat(amount) });
      const data = res.data.data;
      if (data.category) {
        setCategory(data.category); setIsAiCategorized(true);
        toast.success(`AI suggests: ${data.category} (${Math.round((data.confidence || 0) * 100)}% confident)`);
      }
    } catch { toast.error('AI categorization failed'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const data = { title, amount: parseFloat(amount), description, category, date, notes, isAiCategorized };
      if (isEditing) {
        const r = await updateExpense(expense.id, data);
        toast.success('Expense updated');
        if (r.data?.warning) toast.error(r.data.warning, { duration: 5000 });
      } else {
        const r = await createExpense(data);
        toast.success('Expense added!');
        if (r.data?.warning) toast.error(r.data.warning, { duration: 5000 });
      }
      onClose(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(2,8,18,0.75)', backdropFilter: 'blur(8px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #0a1e30 0%, #071525 100%)',
        border: '1px solid rgba(0,232,122,0.2)',
        borderRadius: 22, width: '100%', maxWidth: 500,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,232,122,0.06)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 24px 18px',
          borderBottom: '1px solid rgba(0,232,122,0.08)',
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#d0f0e0', margin: '0 0 3px' }}>
              {isEditing ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <p style={{ fontSize: 11, color: '#3a6a5a', margin: 0, fontWeight: 600 }}>
              {isEditing ? 'Modify existing record' : 'Track a new expense'}
            </p>
          </div>
          <button onClick={() => onClose(false)} style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#5a8a7a', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#5a8a7a'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <Field>
            <Label>Transaction Title</Label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Weekly Groceries" required style={inp}
              onFocus={focusStyle} onBlur={blurStyle} />
          </Field>

          {/* Amount + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field>
              <Label>Amount (NPR)</Label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" required min="0" step="0.01"
                style={{ ...inp, fontWeight: 700, fontSize: 16 }}
                onFocus={focusStyle} onBlur={blurStyle} />
            </Field>
            <Field>
              <Label>Date</Label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ ...inp, colorScheme: 'dark', cursor: 'pointer' }}
                onFocus={focusStyle} onBlur={blurStyle} />
            </Field>
          </div>

          {/* Category */}
          <Field>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label>Category</Label>
              <button type="button" onClick={handleAiCategorize} disabled={aiLoading} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 20,
                background: 'rgba(0,232,122,0.08)',
                border: '1px solid rgba(0,232,122,0.2)',
                color: '#00e87a', fontSize: 11, fontWeight: 700,
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                opacity: aiLoading ? 0.6 : 1, transition: 'all 0.2s',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {aiLoading ? 'Thinking...' : 'AI Suggest'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <select value={category} onChange={e => { setCategory(e.target.value); setIsAiCategorized(false); }}
                style={{ ...inp, paddingRight: 36, cursor: 'pointer', appearance: 'none' }}
                onFocus={focusStyle} onBlur={blurStyle}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0a1e30' }}>{c}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#3a6a5a', pointerEvents: 'none' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </div>
            {isAiCategorized && (
              <p style={{ fontSize: 11, color: '#00e87a', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                ✨ AI categorized
              </p>
            )}
          </Field>

          {/* Notes */}
          <Field>
            <Label>Notes (optional)</Label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context..."
              rows={2}
              style={{
                ...inp, height: 'auto', padding: '12px 14px',
                resize: 'none', lineHeight: 1.5,
              }}
              onFocus={focusStyle} onBlur={blurStyle} />
          </Field>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={() => onClose(false)} style={{
              flex: 1, height: 48, borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#5a8a7a', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#d0f0e0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#5a8a7a'; }}
            >Cancel</button>
            <button type="submit" disabled={loading} style={{
              flex: 2, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #00c866, #00a855)',
              border: 'none', color: '#fff',
              fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              boxShadow: '0 4px 20px rgba(0,232,122,0.3)',
              transition: 'all 0.2s',
            }}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
