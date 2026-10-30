import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  Boxes,
  ShoppingBag,
  UserCheck,
  BarChart3,
  LogOut,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { useNewOrderAlerts } from '../hooks/useNewOrderAlerts';
import { Badge } from './Badge';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Online Orders', path: '/online-orders', icon: ShoppingBag, isOnlineQueue: true },
  { name: 'Sarees & Catalog', path: '/sarees', icon: Layers },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Inventory & Stock', path: '/inventory', icon: Boxes },
  { name: 'Sales & POS', path: '/sales', icon: ShoppingBag },
  { name: 'Employees', path: '/employees', icon: UserCheck },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const { newCount } = useNewOrderAlerts();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-maroon-950 via-maroon-900 to-[#35020D] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-gold-500/30 shadow-2xl lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="relative px-6 py-6 border-b border-gold-500/20 bg-maroon-950/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-4 p-1.5 rounded-lg text-gold-200/70 hover:text-white hover:bg-white/10 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 p-0.5 shadow-gold-glow flex items-center justify-center">
              <div className="w-full h-full bg-maroon-950 rounded-[10px] flex items-center justify-center text-gold-300 font-brand font-bold text-xl">
                🥻
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-brand font-bold text-base tracking-wide text-gold-200">
                  ALTS
                </h1>
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              </div>
              <p className="text-[11px] font-medium tracking-widest text-gold-400/80 uppercase">
                Silks & Sarees
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 font-mono">
              Business Portal v2.6
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gold-400/60">
            Main Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const hasNewBadge = item.isOnlineQueue && newCount > 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                    isActive
                      ? 'bg-gradient-to-r from-gold-500/20 via-maroon-700/50 to-transparent text-gold-200 border-l-4 border-gold-400 shadow-sm font-semibold'
                      : 'text-cream-200/75 hover:bg-white/5 hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-5 h-5 transition-transform group-hover:scale-110',
                        isActive ? 'text-gold-400' : 'text-cream-200/60 group-hover:text-gold-300'
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                    {hasNewBadge && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500 text-maroon-950 font-bold text-[10px] shadow-sm animate-pulse">
                        {newCount}
                      </span>
                    )}
                    {isActive && !hasNewBadge && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400 shadow-gold-glow" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-gold-500/20 bg-maroon-950/60 space-y-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Store Executive'}</p>
                {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />}
              </div>
              <p className="text-[11px] text-gold-300/80 truncate">{user?.roleTitle || (isAdmin ? 'Admin' : 'Staff')}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-950/40 text-rose-200 border border-rose-800/40 hover:bg-rose-900/60 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
