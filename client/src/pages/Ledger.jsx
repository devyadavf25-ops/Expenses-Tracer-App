import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getLedgerEntries,
  createLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry,
} from '../services/ledgerService';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

/* ─── tiny helpers ─────────────────────────────────────────── */
const fmt = (n) => parseFloat(n || 0).toFixed(2);

const STATUS_COLORS = {
  pending:  { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24', border: 'rgba(251,191,36,0.25)'  },
  partial:  { bg: 'rgba(96,165,250,0.12)',  text: '#60a5fa', border: 'rgba(96,165,250,0.25)'  },
  settled:  { bg: 'rgba(52,211,153,0.12)',  text: '#34d399', border: 'rgba(52,211,153,0.25)'  },
};

const TYPE_COLORS = {
  lent:     { bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.25)' },
  borrowed: { bg: 'rgba(96,165,250,0.12)',  text: '#60a5fa', border: 'rgba(96,165,250,0.25)'  },
};

const Badge = ({ color, label }) => (
  <span className="badge" style={{
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: color.bg, color: color.text, border: `1px solid ${color.border}`,
    textTransform: 'capitalize', letterSpacing: '0.04em',
  }}>{label}</span>
);

const SummaryCard = ({ label, value, color, sub }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '18px 22px',
    borderTop: `3px solid ${color}`,
    flex: 1, minWidth: 150,
  }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{label}</p>
    <p style={{ fontSize: 22, fontWeight: 800, color, margin: '0 0 2px' }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
  </div>
);

/* ─── Modal ─────────────────────────────────────────────────── */
const Modal = ({ entry, onClose, onSaved, currency }) => {
  const isEdit = !!entry?.id;
  const [form, setForm] = useState({
    personName:    entry?.personName    || '',
    type:          entry?.type          || 'lent',
    amount:        entry?.amount        || '',
    description:   entry?.description   || '',
    date:          entry?.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate:       entry?.dueDate ? entry.dueDate.split('T')[0] : '',
    notes:         entry?.notes         || '',
    settledAmount: entry?.settledAmount || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.personName.trim()) return toast.error('Person name is required');
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      if (payload.settledAmount === '') payload.settledAmount = 0;
      if (isEdit) await updateLedgerEntry(entry.id, payload);
      else        await createLedgerEntry(payload);
      toast.success(isEdit ? 'Entry updated!' : 'Entry added!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setSaving(false); }
  };

  const inp = (label, key, type = 'text', extra = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      <input
        type={type} value={form[key]} required={extra.required}
        min={extra.min} placeholder={extra.placeholder || ''}
        onChange={e => set(key, e.target.value)}
        style={{
          background: 'var(--bg-card-hover)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px',
          color: 'var(--text-primary)', fontSize: 14, outline: 'none',
          width: '100%', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 28, width: '100%', maxWidth: 500,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.25s ease',
      }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
            {isEdit ? '✏️ Edit Entry' : '📒 New Ledger Entry'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type Toggle */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['lent', 'borrowed'].map(t => (
                <button key={t} type="button" onClick={() => set('type', t)} style={{
                  padding: '12px', borderRadius: 12, border: '2px solid',
                  borderColor: form.type === t ? (t === 'lent' ? '#f87171' : '#60a5fa') : 'var(--border)',
                  background: form.type === t ? (t === 'lent' ? 'rgba(248,113,113,0.1)' : 'rgba(96,165,250,0.1)') : 'var(--bg-card-hover)',
                  color: form.type === t ? (t === 'lent' ? '#f87171' : '#60a5fa') : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {t === 'lent' ? '💸 I Lent' : '🤝 I Borrowed'}
                </button>
              ))}
            </div>
          </div>

          {inp('Person Name', 'personName', 'text', { required: true, placeholder: 'e.g. Ram Bahadur' })}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {inp('Amount', 'amount', 'number', { required: true, min: '0.01', placeholder: '0.00' })}
            {isEdit && inp('Settled Amount', 'settledAmount', 'number', { min: '0', placeholder: '0.00' })}
            {!isEdit && inp('Date', 'date', 'date')}
          </div>
          {isEdit && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {inp('Date', 'date', 'date')}
              {inp('Due Date (optional)', 'dueDate', 'date')}
            </div>
          )}
          {!isEdit && inp('Due Date (optional)', 'dueDate', 'date')}

          {inp('Description', 'description', 'text', { placeholder: 'What was it for?' })}
          {inp('Notes (optional)', 'notes', 'text', { placeholder: 'Any extra details...' })}

          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, height: 46, background: 'var(--bg-card-hover)', border: '1px solid var(--border)',
              borderRadius: 12, color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              flex: 2, height: 46,
              background: 'linear-gradient(135deg, #00c866, #00a855)',
              border: 'none', borderRadius: 12, color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
              boxShadow: '0 4px 16px var(--accent-glow)',
            }}>
              {saving ? '⏳ Saving…' : isEdit ? '✅ Save Changes' : '➕ Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Settle Modal ──────────────────────────────────────────── */
const SettleModal = ({ entry, onClose, onSaved, currency }) => {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const remaining = parseFloat(entry.amount) - parseFloat(entry.settledAmount || 0);

  const handleSettle = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return toast.error('Enter a valid amount');
    if (val > remaining + 0.01) return toast.error(`Cannot exceed remaining amount (${fmt(remaining)})`);
    setSaving(true);
    try {
      const newSettled = parseFloat(entry.settledAmount || 0) + val;
      await updateLedgerEntry(entry.id, { settledAmount: newSettled });
      toast.success('Payment recorded! 🎉');
      onSaved(); onClose();
    } catch { toast.error('Failed to record payment'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1001,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 28, width: '100%', maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.25s ease',
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
          💰 Record Payment
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>
          {entry.type === 'lent' ? `${entry.personName} is paying you back` : `You are paying back ${entry.personName}`}
        </p>

        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 12, padding: 14, marginBottom: 18, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</p>
            <p style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)', fontSize: 16 }}>{currency} {fmt(entry.amount)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>REMAINING</p>
            <p style={{ margin: 0, fontWeight: 800, color: '#f87171', fontSize: 16 }}>{currency} {fmt(remaining)}</p>
          </div>
        </div>

        <form onSubmit={handleSettle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Payment Amount</label>
            <input
              type="number" min="0.01" step="any" value={amount} required
              onChange={e => setAmount(e.target.value)} placeholder={`Max: ${fmt(remaining)}`}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-card-hover)', border: '1px solid var(--accent)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, outline: 'none' }}
            />
          </div>
          <button type="button" onClick={() => setAmount(fmt(remaining))} style={{
            background: 'var(--accent-dim)', border: '1px solid var(--border-hover)', borderRadius: 10,
            color: 'var(--accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '8px',
          }}>
            ✅ Mark Fully Settled ({currency} {fmt(remaining)})
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 44, background: 'var(--bg-card-hover)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 2, height: 44, background: 'linear-gradient(135deg,#00c866,#00a855)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Entry Card ────────────────────────────────────────────── */
const EntryCard = ({ entry, currency, onEdit, onSettle, onDelete }) => {
  const remaining = parseFloat(entry.amount) - parseFloat(entry.settledAmount || 0);
  const pct = Math.min(100, (parseFloat(entry.settledAmount || 0) / parseFloat(entry.amount)) * 100);
  const isOverdue = entry.dueDate && new Date(entry.dueDate) < new Date() && entry.status !== 'settled';

  return (
    <div className="entry-card" style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '18px 20px',
      transition: 'all 0.2s',
      borderLeft: `4px solid ${entry.type === 'lent' ? '#f87171' : '#60a5fa'}`,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{entry.personName}</span>
            <Badge color={TYPE_COLORS[entry.type]} label={entry.type === 'lent' ? '💸 I Lent' : '🤝 Borrowed'} />
            <Badge color={STATUS_COLORS[entry.status]} label={entry.status} />
            {isOverdue && <Badge color={{ bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.25)' }} label="⚠️ Overdue" />}
          </div>
          {entry.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.description}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              📅 {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {entry.dueDate && (
              <span style={{ fontSize: 11, color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}>
                ⏰ Due: {new Date(entry.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 900, color: entry.type === 'lent' ? '#f87171' : '#60a5fa' }}>
            {currency} {fmt(entry.amount)}
          </p>
          {entry.status !== 'settled' && (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              Remaining: <strong style={{ color: 'var(--text-primary)' }}>{currency} {fmt(remaining)}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {entry.status !== 'settled' && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Settled: {currency} {fmt(entry.settledAmount)}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-card-hover)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 10, background: 'linear-gradient(90deg,#00c866,#00e87a)', transition: 'width 0.6s ease', boxShadow: '0 0 8px var(--accent-glow)' }} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {entry.status !== 'settled' && (
          <button onClick={() => onSettle(entry)} style={{ ...actionBtn, background: 'rgba(0,232,122,0.1)', color: '#00e87a', border: '1px solid rgba(0,232,122,0.25)' }}>
            💰 Record Payment
          </button>
        )}
        <button onClick={() => onEdit(entry)} style={{ ...actionBtn }}>✏️ Edit</button>
        <button onClick={() => onDelete(entry.id)} style={{ ...actionBtn, color: '#f87171' }}>🗑️</button>
      </div>
    </div>
  );
};

const actionBtn = {
  padding: '7px 14px', borderRadius: 9, border: '1px solid var(--border)',
  background: 'var(--bg-card-hover)', color: 'var(--text-secondary)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
};

/* ─── Main Page ─────────────────────────────────────────────── */
const Ledger = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  const [data, setData]       = useState({ entries: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);   // null | 'add' | entry-obj
  const [settleEntry, setSettleEntry] = useState(null);
  const [filter, setFilter]   = useState({ type: '', status: '', search: '' });
  const [activeTab, setActiveTab] = useState('all'); // all | lent | borrowed

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') params.type = activeTab;
      if (filter.status) params.status = filter.status;
      if (filter.search) params.search = filter.search;
      const res = await getLedgerEntries(params);
      setData(res.data.data);
    } catch (e) { toast.error('Failed to load ledger'); }
    finally { setLoading(false); }
  }, [activeTab, filter.status, filter.search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteLedgerEntry(id);
      toast.success('Entry deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const { summary } = data;
  const netPositive = (summary.netBalance || 0) >= 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            📒 <span style={{ color: 'var(--accent)' }}>My Ledger</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Track money you lent or borrowed</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => window.print()}
            className="no-print"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', 
              borderRadius: 14, background: 'var(--bg-card-hover)', border: '1px solid var(--border)', 
              color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', 
              transition: 'all 0.2s' 
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            🖨️ Print Report
          </button>
          <button
            onClick={() => setModal('add')}
            className="no-print"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 14, background: 'linear-gradient(135deg,#00c866,#00a855)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px var(--accent-glow)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Entry
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print, aside, nav, button, .row-actions, .chatbot-container { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 0 !important; width: 100% !important; }
          .animate-fade-in { animation: none !important; }
          .entry-card { 
            break-inside: avoid; 
            border: 1px solid #eee !important; 
            background: white !important;
            box-shadow: none !important;
            margin-bottom: 15px !important;
          }
          h1, h2, h3, p, span { color: black !important; }
          .badge { border: 1px solid #ccc !important; background: #f9f9f9 !important; color: #333 !important; }
        }
      `}</style>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <SummaryCard label="I Lent Total"     value={`${currency} ${fmt(summary.totalLent)}`}      color="#f87171" sub={`Pending: ${currency} ${fmt(summary.pendingLent)}`} />
        <SummaryCard label="I Borrowed Total" value={`${currency} ${fmt(summary.totalBorrowed)}`}  color="#60a5fa" sub={`Pending: ${currency} ${fmt(summary.pendingBorrowed)}`} />
        <SummaryCard
          label="Net Balance"
          value={`${netPositive ? '▲' : '▼'} ${currency} ${fmt(Math.abs(summary.netBalance || 0))}`}
          color={netPositive ? '#34d399' : '#f87171'}
          sub={netPositive ? 'Others owe you more' : 'You owe others more'}
        />
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Tab Pills */}
        {['all', 'lent', 'borrowed'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 18px', borderRadius: 20, border: '1px solid',
            borderColor: activeTab === t ? 'var(--accent)' : 'var(--border)',
            background: activeTab === t ? 'var(--accent-dim)' : 'var(--bg-card-hover)',
            color: activeTab === t ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
            textTransform: 'capitalize',
          }}>{t === 'all' ? '📋 All' : t === 'lent' ? '💸 Lent' : '🤝 Borrowed'}</button>
        ))}

        {/* Status Filter */}
        <select
          value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
          style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card-hover)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none' }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="partial">Partially Settled</option>
          <option value="settled">Settled</option>
        </select>

        {/* Search */}
        <input
          type="text" placeholder="🔍 Search by person…"
          value={filter.search} onChange={e => setFilter(p => ({ ...p, search: e.target.value }))}
          style={{ flex: 1, minWidth: 180, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card-hover)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
        />
      </div>

      {/* Entries List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="page-spinner" /></div>
      ) : data.entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📒</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>No entries yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>Start tracking who owes whom!</p>
          <button onClick={() => setModal('add')} style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#00c866,#00a855)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            ➕ Add First Entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.entries.map(entry => (
            <EntryCard
              key={entry.id} entry={entry} currency={currency}
              onEdit={e => setModal(e)}
              onSettle={e => setSettleEntry(e)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <Modal
          entry={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchData}
          currency={currency}
        />
      )}
      {settleEntry && (
        <SettleModal
          entry={settleEntry}
          onClose={() => setSettleEntry(null)}
          onSaved={fetchData}
          currency={currency}
        />
      )}
    </div>
  );
};

export default Ledger;
