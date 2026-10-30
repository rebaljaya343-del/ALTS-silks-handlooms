import React, { useEffect, useState, useCallback } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';

const STEPS = [
  { id: 'New', label: 'Placed', icon: Clock },
  { id: 'Accepted', label: 'Accepted', icon: CheckCircle2 },
  { id: 'Packed', label: 'Packed', icon: Package },
  { id: 'Shipped', label: 'Shipped', icon: Truck },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle },
];

const getStepIndex = (status) => {
  switch (status) {
    case 'New':
    case 'Pending':
      return 0;
    case 'Accepted':
      return 1;
    case 'Packed':
      return 2;
    case 'Shipped':
      return 3;
    case 'Delivered':
    case 'Completed':
      return 4;
    default:
      return -1;
  }
};

export const CustomerMyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      if (!isSilent) {
        toast.error('Unable to load your orders');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(false);

    // Refresh every 20 seconds for live status tracking
    const interval = setInterval(() => {
      loadOrders(true);
    }, 20000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-2xl border border-cream-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-maroon-800 border-t-transparent animate-spin" />
          <span>Loading your order status and history…</span>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-cream-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gold-50 flex items-center justify-center border border-gold-300/60 text-gold-600">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-brand text-2xl font-bold text-maroon-950">No orders placed yet</h1>
        <p className="mt-2 text-sm text-slate-500">
          Discover our exclusive bridal Kanjivaram and heritage silk collections.
        </p>
        <div className="mt-6">
          <Button variant="gold" onClick={() => (window.location.href = '/shop')}>
            Explore Collections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
        <div>
          <h1 className="font-brand text-2xl font-bold text-maroon-950">My Orders & Live Status</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live progress for your ALTS silks purchases (auto-refreshes every 20s)
          </p>
        </div>

        <button
          onClick={() => loadOrders(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cream-300 text-xs font-semibold text-slate-700 hover:bg-cream-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-maroon-800' : 'text-slate-500'}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {orders.map((order) => {
          const isTerminalFailed = ['Rejected', 'Cancelled'].includes(order.status);
          const currentStepIdx = getStepIndex(order.status);

          return (
            <div
              key={order.id}
              className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Order Header */}
              <div className="flex flex-col gap-2 border-b border-cream-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-base font-bold text-maroon-950">
                      {order.orderNumber}
                    </span>
                    <Badge dot>{order.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Placed on {formatDate(order.date, true)}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[11px] text-slate-400">Total Bill (incl. 5% GST)</p>
                  <p className="font-brand text-xl font-bold text-maroon-950">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="my-6 px-2 sm:px-6">
                {isTerminalFailed ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-900">
                    <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                      <span>
                        {order.status === 'Rejected'
                          ? 'Order Rejected by Store'
                          : 'Order Cancelled'}
                      </span>
                    </div>

                    {order.rejectionReason && (
                      <p className="mt-2 pl-7 text-xs text-rose-800 leading-relaxed">
                        <strong>Reason provided: </strong>
                        {order.rejectionReason}
                      </p>
                    )}

                    <p className="mt-2 pl-7 text-[11px] text-rose-600">
                      If any payment was collected, a full refund will be credited to your account.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Connecting Progress Line */}
                    <div className="absolute top-5 left-6 right-6 h-1 bg-cream-200 -z-0">
                      <div
                        className="h-full bg-gradient-to-r from-gold-500 to-emerald-500 transition-all duration-500"
                        style={{
                          width: `${(Math.max(0, currentStepIdx) / (STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Step Nodes */}
                    <div className="relative z-10 flex justify-between items-start">
                      {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;

                        return (
                          <div
                            key={step.id}
                            className="flex flex-col items-center text-center max-w-[70px] sm:max-w-[90px]"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                isCurrent
                                  ? 'bg-maroon-950 border-gold-400 text-gold-300 shadow-md ring-4 ring-gold-400/20 scale-110'
                                  : isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'bg-white border-cream-300 text-slate-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            <span
                              className={`mt-2 text-[11px] font-bold tracking-tight ${
                                isCurrent
                                  ? 'text-maroon-950 font-extrabold'
                                  : isDone
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </span>

                            {isCurrent && (
                              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-600 animate-pulse">
                                Current
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="mt-5 rounded-2xl bg-[#FAF7F2] p-4 border border-cream-200">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Purchased Items
                </p>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-cream-100 last:border-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover border border-cream-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-maroon-900/10 text-maroon-900 flex items-center justify-center font-bold text-xs">
                            🥻
                          </div>
                        )}
                        <span className="font-medium text-slate-800 truncate">
                          {item.name || 'Saree Item'}
                        </span>
                        <span className="text-xs text-slate-500">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 font-brand">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2.5 border-t border-cream-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Payment Mode: <strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</strong></span>
                  {order.handledBy && (
                    <span className="text-[11px] text-slate-400">
                      Staff Verified: <strong>{order.handledBy}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
