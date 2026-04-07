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
    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-center min-h-[160px] group relative overflow-hidden">
      <div className="absolute top-4 right-4 p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onEdit}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-slate-100"
        >
          <HiOutlinePencil size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100">
              <HiOutlineFlag className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-1">{title}</h3>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(current)}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between max-w-[200px]">
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-widest font-extrabold text-slate-400 mb-0.5 opacity-70">Target</p>
              <p className="text-xs font-black text-purple-600">{formatCurrency(target)}</p>
            </div>
            {daysLeft !== null && (
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest font-extrabold text-slate-400 mb-0.5 opacity-70">Status</p>
                <p className={`text-xs font-black ${daysLeft < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90 filter drop-shadow-sm">
            {/* Background circle */}
            <circle
              className="text-slate-100"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
            {/* Progress circle */}
            <circle
              className="text-purple-600 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-slate-900 tracking-tighter">{Math.round(percent)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
