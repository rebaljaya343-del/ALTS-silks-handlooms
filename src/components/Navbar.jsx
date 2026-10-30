import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Plus,
  ShoppingBag,
  Store,
  Sparkles,
  Layers,
  ChevronDown,
  CheckCircle,
  ShoppingCart,
  Volume2,
  VolumeX,
  Clock,
  Boxes,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import { sareeService } from '../services/sareeService';
import { useCart } from '../hooks/useCart';
import { useNewOrderAlerts } from '../hooks/useNewOrderAlerts';
import { formatCurrency, formatDate } from '../utils/formatters';

export const Navbar = ({ onOpenSidebar, pageTitle = 'Dashboard' }) => {
  const { user, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { newCount, latestOrders, isMuted, toggleMute } = useNewOrderAlerts();
  const navigate = useNavigate();

  const [lowStockCount, setLowStockCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const sarees = await sareeService.getSarees();
        const alerts = sarees.filter((s) => s.stock <= (s.lowStockThreshold || 5));
        setLowStockCount(alerts.length);
        setLowStockItems(alerts.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch stock alerts:', err);
      }
    };
    fetchAlerts();
  }, []);

  const totalAlertCount = newCount + lowStockCount;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-cream-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-maroon-900 bg-white border border-cream-200 hover:bg-cream-100 lg:hidden shadow-sm cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-maroon-800 font-medium">
              <Store className="w-3.5 h-3.5 text-gold-600" />
              T. Nagar Flagship Showroom
            </span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">{pageTitle}</span>
          </div>
          <h2 className="text-lg font-bold font-brand text-maroon-950">{pageTitle}</h2>
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick New Sale POS Button */}
        <Button
          variant="gold"
          size="sm"
          icon={ShoppingBag}
          onClick={() => navigate('/sales?action=new')}
          className="hidden sm:inline-flex shadow-sm"
        >
          New Sale (POS)
        </Button>

        <button
          title="Open shopping cart"
          onClick={() => navigate('/shop/cart')}
          className="relative rounded-xl border border-cream-200 bg-white p-2 text-maroon-900 shadow-sm transition-colors hover:border-gold-400 cursor-pointer"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-maroon-800 text-[10px] font-bold text-gold-100 ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-white border border-cream-200 hover:border-gold-400 text-maroon-900 shadow-sm transition-colors cursor-pointer"
            title="Notifications & Live Alerts"
          >
            <Bell className="w-5 h-5" />
            {totalAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-maroon-950 ring-2 ring-white animate-pulse">
                {totalAlertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 rounded-2xl bg-white p-4 shadow-2xl border border-cream-200 z-50 animate-scale-up">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-cream-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-brand font-bold text-xs text-maroon-950 uppercase tracking-wider">
                    Desk Alerts ({totalAlertCount})
                  </h4>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1 rounded-md text-slate-400 hover:text-maroon-900 hover:bg-cream-100 transition-colors"
                    title={isMuted ? 'Sound alerts muted (Click to unmute)' : 'Sound alerts active (Click to mute)'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-semibold">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/online-orders');
                    }}
                    className="text-gold-700 hover:underline cursor-pointer"
                  >
                    Online Desk
                  </button>
                </div>
              </div>

              <div className="py-2 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {/* Section 1: Online Orders */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50/80 px-2 py-1 rounded-md mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      New Online Orders
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px]">
                      {newCount}
                    </span>
                  </div>

                  {newCount > 0 ? (
                    <div className="space-y-1.5">
                      {latestOrders.map((order, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/online-orders');
                          }}
                          className="p-2.5 rounded-xl bg-[#FAF7F2] border border-gold-300/60 hover:bg-gold-50/70 cursor-pointer transition-colors text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-maroon-950">
                              {order.orderNumber}
                            </span>
                            <span className="font-brand font-bold text-maroon-950">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-medium text-slate-700 truncate max-w-[150px]">
                              {order.customerName}
                            </span>
                            <span>{formatDate(order.date, true)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 py-1 text-center">
                      No new customer orders in queue
                    </p>
                  )}
                </div>

                {/* Section 2: Low Stock Alerts */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-1 rounded-md mb-2">
                    <span className="flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-slate-600" />
                      Low Stock Sarees
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 text-[10px]">
                      {lowStockCount}
                    </span>
                  </div>

                  {lowStockItems.length > 0 ? (
                    <div className="space-y-1.5">
                      {lowStockItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/inventory');
                          }}
                          className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs flex items-center justify-between hover:bg-amber-100/80 cursor-pointer transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-amber-950 truncate">{item.name}</p>
                            <p className="text-[10px] text-amber-800 font-mono">
                              {item.sku} • {item.category}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]">
                            {item.stock} left
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 py-1 text-center">
                      All inventory stock levels healthy
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-cream-300">
          <div className="text-left">
            <p className="text-xs font-semibold text-maroon-950 truncate max-w-[140px]">
              {user?.name || 'Staff User'}
            </p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'Staff'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
