import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineCurrencyDollar,
  HiOutlineSparkles,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineCog,
} from 'react-icons/hi';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/expenses', label: 'Expenses', icon: HiOutlineCurrencyDollar },
  { path: '/ai-insights', label: 'AI Insights', icon: HiOutlineSparkles },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl glass text-white lg:hidden cursor-pointer"
      >
        {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 glass z-40 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold gradient-text">ExpenseAI</h1>
          <p className="text-dark-400 text-sm mt-1">Smart Tracker</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                    : 'text-dark-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-600/30 flex items-center justify-center">
              <HiOutlineUser size={20} className="text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-dark-400 hover:bg-danger/10 hover:text-danger transition-all duration-200 cursor-pointer bg-transparent border-0 text-sm"
          >
            <HiOutlineLogout size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
