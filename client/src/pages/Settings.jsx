import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineCurrencyDollar, HiOutlineFlag } from 'react-icons/hi';
import { toInputDate } from '../utils/dateUtils';

const Settings = () => {
  const { user, updateUserSettings } = useAuth();
  
  // State for Budget
  const [budget, setBudget] = useState(user?.monthlyBudget || '');
  const [savingBudget, setSavingBudget] = useState(false);

  // State for Goal
  const [goalAmount, setGoalAmount] = useState(user?.savingsGoal?.targetAmount || '');
  const [goalDate, setGoalDate] = useState(
    user?.savingsGoal?.targetDate ? toInputDate(user.savingsGoal.targetDate) : ''
  );
  const [savingGoal, setSavingGoal] = useState(false);

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    setSavingBudget(true);
    await updateUserSettings({ monthlyBudget: Number(budget) });
    setSavingBudget(false);
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    setSavingGoal(true);
    await updateUserSettings({
      savingsGoal: {
        ...user.savingsGoal,
        targetAmount: Number(goalAmount),
        targetDate: goalDate,
      }
    });
    setSavingGoal(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-dark-400">Manage your profile, budgets, and savings goals.</p>
      </div>

      {/* Profile Info (Read Only) */}
      <section className="glass rounded-2xl p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
            <HiOutlineUser className="text-primary-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Profile Information</h2>
            <p className="text-sm text-dark-400">Your basic account details</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
            <input type="text" value={user?.name || ''} readOnly className="input-dark bg-dark-800/50 cursor-not-allowed opacity-70" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
            <input type="email" value={user?.email || ''} readOnly className="input-dark bg-dark-800/50 cursor-not-allowed opacity-70" />
          </div>
        </div>
      </section>

      {/* Budget Limit Setup */}
      <section className="glass rounded-2xl p-6 lg:p-8 border border-primary-500/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-info-500/20 flex items-center justify-center">
            <HiOutlineCurrencyDollar className="text-info-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Monthly Budget Alert</h2>
            <p className="text-sm text-dark-400">We'll warn you if you exceed this limit</p>
          </div>
        </div>

        <form onSubmit={handleUpdateBudget} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-dark-300 mb-2">Maximum Budget ({user?.currency})</label>
            <input 
              type="number" 
              min="0" 
              step="0.01"
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
              placeholder="e.g. 50000"
              className="input-dark" 
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={savingBudget}
            className="btn-gradient px-8 min-h-[44px] w-full md:w-auto mt-4 md:mt-0 disabled:opacity-50"
          >
            {savingBudget ? 'Saving...' : 'Update Budget'}
          </button>
        </form>
      </section>

      {/* Savings Goal Setup */}
      <section className="glass rounded-2xl p-6 lg:p-8 border border-purple-500/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <HiOutlineFlag className="text-purple-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Savings Goal</h2>
            <p className="text-sm text-dark-400">Track your progress toward a financial target</p>
          </div>
        </div>

        <form onSubmit={handleUpdateGoal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Target Amount ({user?.currency})</label>
              <input 
                type="number" 
                min="0"
                step="0.01" 
                value={goalAmount} 
                onChange={(e) => setGoalAmount(e.target.value)} 
                placeholder="e.g. 100000"
                className="input-dark" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Target Date</label>
              <input 
                type="date" 
                value={goalDate} 
                onChange={(e) => setGoalDate(e.target.value)} 
                className="input-dark relative" 
                required
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={savingGoal}
              className="px-8 py-2.5 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors border border-purple-500/30 font-medium disabled:opacity-50 w-full md:w-auto cursor-pointer"
            >
              {savingGoal ? 'Saving Goal...' : 'Set Goal'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Settings;
