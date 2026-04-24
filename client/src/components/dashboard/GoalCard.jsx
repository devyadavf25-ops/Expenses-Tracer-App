import { HiOutlineFlag, HiOutlinePencil } from 'react-icons/hi';
import { formatCurrency } from '../../utils/formatCurrency';

const GoalCard = ({ title, target, current, targetDate, onEdit }) => {
  const percent = Math.min(100, Math.max(0, target > 0 ? (current / target) * 100 : 0));
  
  // Calculate days left
  let daysLeft = null;
  if (targetDate) {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    daysLeft = Math.ceil(diff / (1000 * 3600 * 24));
  }

  // Calculate circumference for SVG circle
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 20,
      padding: '28px 24px',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: 160,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.querySelector('.goal-edit-btn').style.opacity = '1'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.querySelector('.goal-edit-btn').style.opacity = '0'; }}
    >
      {/* Edit button */}
      <div className="goal-edit-btn" style={{ position: 'absolute', top: 14, right: 14, opacity: 0, transition: 'opacity 0.2s' }}>
        <button
          onClick={onEdit}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <HiOutlinePencil size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        {/* Left side */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HiOutlineFlag color="#a78bfa" size={22} />
            </div>
            <div>
              <h3 style={{
                fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 4px',
              }}>{title}</h3>
              <p style={{
                fontSize: 20, fontWeight: 900, color: 'var(--text-primary)',
                letterSpacing: '-0.5px', margin: 0,
              }}>{formatCurrency(current)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, maxWidth: 220 }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 2px', opacity: 0.7 }}>Target</p>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', margin: 0 }}>{formatCurrency(target)}</p>
            </div>
            {daysLeft !== null && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 2px', opacity: 0.7 }}>Status</p>
                <p style={{ fontSize: 12, fontWeight: 800, color: daysLeft < 0 ? '#f87171' : '#34d399', margin: 0 }}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Circular Progress */}
        <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
          <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {/* Background circle */}
            <circle
              strokeWidth="10"
              stroke="var(--bg-card-hover)"
              fill="transparent"
              r={radius}
              cx="44"
              cy="44"
            />
            {/* Progress circle */}
            <circle
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="#a78bfa"
              fill="transparent"
              r={radius}
              cx="44"
              cy="44"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {Math.round(percent)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
