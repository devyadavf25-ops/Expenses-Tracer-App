import { HiOutlineFlag, HiOutlinePencil } from 'react-icons/hi';
import { formatCurrency } from '../../../utils/formatCurrency';

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
    <div className="glass rounded-2xl p-6 relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onEdit}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-dark-300 hover:text-white transition-colors cursor-pointer border-none"
        >
          <HiOutlinePencil size={16} />
        </button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
            <HiOutlineFlag className="text-purple-400" size={24} />
          </div>
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {formatCurrency(current)}
          </h3>
          <p className="text-sm text-dark-300 mt-1">
            of {formatCurrency(target)} goal
          </p>
          {daysLeft !== null && (
            <p className={`text-xs mt-3 ${daysLeft < 0 ? 'text-danger-400' : 'text-success-400'}`}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
            </p>
          )}
        </div>

        {/* Circular Progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              className="text-dark-600"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="40"
              cy="40"
            />
            {/* Progress circle */}
            <circle
              className="text-purple-500 transition-all duration-1000 ease-out"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="40"
              cy="40"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{Math.round(percent)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
