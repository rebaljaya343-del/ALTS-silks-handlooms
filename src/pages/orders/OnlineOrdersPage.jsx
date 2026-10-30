import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  Search,
  RefreshCw,
  AlertCircle,
  User,
  CreditCard,
  Banknote,
  Receipt,
  Eye,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useNewOrderAlerts } from '../../hooks/useNewOrderAlerts';
import { InvoiceModal } from '../sales/InvoiceModal';

const TABS = [
  { id: 'New', label: 'New Requests', icon: Clock, color: 'amber' },
  { id: 'Accepted', label: 'Accepted', icon: CheckCircle2, color: 'blue' },
  { id: 'Packed', label: 'Packed', icon: Package, color: 'indigo' },
  { id: 'Shipped', label: 'Shipped', icon: Truck, color: 'purple' },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle, color: 'emerald' },
  { id: 'Rejected', label: 'Rejected / Cancelled', icon: XCircle, color: 'rose' },
];

const REJECTION_OPTIONS = [
  'Out of stock',
  'Cannot deliver to this area',
  'Customer unreachable',
  'Other',
];

export const OnlineOrdersPage = () => {
  const navigate = useNavigate();
  const { refetch: refetchAlerts } = useNewOrderAlerts();

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('New');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Rejection modal state
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionPreset, setRejectionPreset] = useState('Out of stock');
  const [rejectionCustom, setRejectionCustom] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Invoice modal state
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const fetchOnlineOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrders({
        source: 'Online',
      });
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load online orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineOrders();
  }, []);

  // Compute count per tab
  const tabCounts = useMemo(() => {
    const counts = {
      New: 0,
      Accepted: 0,
      Packed: 0,
      Shipped: 0,
      Delivered: 0,
      Rejected: 0,
    };
    for (const o of orders) {
      if (['Rejected', 'Cancelled'].includes(o.status)) {
        counts.Rejected += 1;
      } else if (counts[o.status] !== undefined) {
        counts[o.status] += 1;
      }
    }
    return counts;
  }, [orders]);

  // Filter orders by active tab and search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab matching
      let matchesTab = false;
      if (activeTab === 'Rejected') {
        matchesTab = ['Rejected', 'Cancelled'].includes(order.status);
      } else {
        matchesTab = order.status === activeTab;
      }
      if (!matchesTab) return false;

      // Search matching
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        order.orderNumber?.toLowerCase().includes(q) ||
        order.invoiceNumber?.toLowerCase().includes(q) ||
        order.customerName?.toLowerCase().includes(q) ||
        order.customerPhone?.toLowerCase().includes(q)
      );
    });
  }, [orders, activeTab, search]);

  const handleStatusTransition = async (orderId, newStatus, reason = null) => {
    try {
      setIsUpdating(true);
      await orderService.updateOrderStatus(orderId, newStatus, reason);
      toast.success(`Order updated to ${newStatus}`);
      await fetchOnlineOrders();
      refetchAlerts();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to update order status';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenRejectModal = (order) => {
    setRejectingOrder(order);
    setRejectionPreset('Out of stock');
    setRejectionCustom('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrder) return;
    const finalReason =
      rejectionPreset === 'Other'
        ? rejectionCustom.trim()
        : rejectionCustom.trim()
        ? `${rejectionPreset}: ${rejectionCustom.trim()}`
        : rejectionPreset;

    if (!finalReason) {
      toast.error('Please specify a rejection reason');
      return;
    }

    try {
      setIsSubmittingReject(true);
      await handleStatusTransition(rejectingOrder.id, 'Rejected', finalReason);
      setRejectingOrder(null);
    } finally {
      setIsSubmittingReject(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-maroon-900 to-maroon-950 text-gold-300 border border-gold-400/40 shadow-sm">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-xl font-bold text-maroon-950">Online Orders Desk</h1>
              {tabCounts.New > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-xs animate-pulse">
                  {tabCounts.New} New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Live queue for customer storefront orders, verification, fulfillment, and dispatches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchOnlineOrders}
            isLoading={isLoading}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-cream-200 shadow-sm">
        <div className="w-full md:max-w-md">
          <Input
            icon={Search}
            placeholder="Search by order #, invoice #, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-maroon-950">{filteredOrders.length}</span> orders in {activeTab}
        </div>
      </div>

      {/* Status Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tabCounts[tab.id] || 0;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                isActive
                  ? 'bg-maroon-950 text-gold-200 shadow-md ring-2 ring-gold-400/50'
                  : 'bg-white text-slate-600 border border-cream-200 hover:bg-cream-50 hover:text-maroon-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isActive
                    ? 'bg-gold-400 text-maroon-950'
                    : count > 0
                    ? 'bg-cream-200 text-slate-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-8 shadow-sm">
          <EmptyState
            title={`No ${activeTab} orders`}
            description={
              search
                ? `No orders matching "${search}" found in ${activeTab}.`
                : activeTab === 'New'
                ? 'Great job! All incoming customer online orders have been processed.'
                : `No orders currently in the ${activeTab} state.`
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOrders.map((order) => {
            const isCod = order.paymentMethod === 'COD';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-cream-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-cream-100 bg-[#FAF7F2]/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-maroon-950">
                          {order.orderNumber}
                        </span>
                        <Badge dot>{order.status}</Badge>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-100 text-gold-900 border border-gold-300">
                          Online
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Placed on {formatDate(order.date, true)}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Receipt}
                      onClick={() => setInvoiceOrder(order)}
                      title="View tax invoice"
                    >
                      Invoice
                    </Button>
                  </div>

                  {/* Customer Info Pill */}
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-cream-200">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400">Customer</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="font-mono font-semibold text-maroon-800 hover:text-gold-700 hover:underline truncate block"
                        >
                          {order.customerPhone}
                        </a>
                        <p className="text-[10px] text-slate-400">Tap to call</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items & Financials */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Sarees Ordered List */}
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Items Ordered ({order.items?.length || 0})
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2 rounded-xl bg-cream-50/70 border border-cream-100 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || 'Saree'}
                                className="w-9 h-9 rounded-lg object-cover border border-cream-200 shadow-2xs"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-maroon-900/10 text-maroon-900 flex items-center justify-center font-bold text-sm">
                                🥻
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{item.name || 'Saree'}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {formatCurrency(item.price)} × {item.quantity} pcs
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 font-brand">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Bill Summary */}
                  <div className="pt-3 border-t border-cream-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Payment:</span>
                      {isCod ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[11px]">
                          <Banknote className="w-3.5 h-3.5 text-amber-700" />
                          Cash on Delivery (COD)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[11px]">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          {order.paymentMethod} (Prepaid)
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Total (incl. 5% GST)</p>
                      <p className="font-brand font-bold text-base text-maroon-950">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {order.notes && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <span className="font-bold text-slate-700">Note: </span>
                      {order.notes}
                    </div>
                  )}

                  {/* Audit Trail & Rejection Reason */}
                  {order.rejectionReason && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Rejection Reason:</span>
                      </div>
                      <p className="mt-1 text-rose-700 pl-5">{order.rejectionReason}</p>
                    </div>
                  )}

                  {order.handledBy && (
                    <p className="text-[11px] text-slate-400 italic">
                      Processed by <strong className="text-slate-600 font-semibold">{order.handledBy}</strong>
                      {order.handledAt && ` on ${formatDate(order.handledAt, true)}`}
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 border-t border-cream-200 bg-[#FAF7F2] flex items-center justify-end gap-2.5">
                  {order.status === 'New' && (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenRejectModal(order)}
                        disabled={isUpdating}
                      >
                        Reject Order
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleStatusTransition(order.id, 'Accepted')}
                        isLoading={isUpdating}
                      >
                        Accept Order
                      </Button>
                    </>
                  )}

                  {order.status === 'Accepted' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusTransition(order.id, 'Cancelled')}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Package}
                        onClick={() => handleStatusTransition(order.id, 'Packed')}
                        isLoading={isUpdating}
                      >
                        Mark as Packed
                      </Button>
                    </>
                  )}

                  {order.status === 'Packed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusTransition(order.id, 'Cancelled')}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Truck}
                        onClick={() => handleStatusTransition(order.id, 'Shipped')}
                        isLoading={isUpdating}
                      >
                        Mark as Shipped
                      </Button>
                    </>
                  )}

                  {order.status === 'Shipped' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleStatusTransition(order.id, 'Delivered')}
                      isLoading={isUpdating}
                    >
                      Mark as Delivered
                    </Button>
                  )}

                  {['Delivered', 'Rejected', 'Cancelled'].includes(order.status) && (
                    <span className="text-xs font-semibold text-slate-400">
                      Order lifecycle complete
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!rejectingOrder}
        onClose={() => setRejectingOrder(null)}
        title="Reject Online Order"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <p className="font-bold">Important Notice:</p>
            <p className="mt-0.5">
              Rejecting order <strong>{rejectingOrder?.orderNumber}</strong> will immediately return all reserved saree items back into active stock and reverse customer metrics.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Rejection *
            </label>
            <Select
              options={REJECTION_OPTIONS}
              value={rejectionPreset}
              onChange={(e) => setRejectionPreset(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Additional Details / Comments {rejectionPreset === 'Other' && '*'}
            </label>
            <textarea
              className="w-full rounded-xl border border-cream-300 p-3 text-xs focus:ring-2 focus:ring-maroon-700 focus:outline-none"
              rows={3}
              placeholder="Provide context for customer and audit logs..."
              value={rejectionCustom}
              onChange={(e) => setRejectionCustom(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingOrder(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReject}
              isLoading={isSubmittingReject}
              disabled={rejectionPreset === 'Other' && !rejectionCustom.trim()}
            >
              Confirm Rejection & Restock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Tax Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          order={invoiceOrder}
        />
      )}
    </div>
  );
};
