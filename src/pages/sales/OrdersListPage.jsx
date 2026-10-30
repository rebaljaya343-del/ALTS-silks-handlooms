import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Plus,
  Search,
  Download,
  Receipt,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  IndianRupee,
} from 'lucide-react';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { InvoiceModal } from './InvoiceModal';
import { NewOrderPage } from './NewOrderPage';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../hooks/useAuth';

export const OrdersListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isNewOrderMode = new URLSearchParams(location.search).get('action') === 'new';

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    if (!isNewOrderMode) {
      loadOrders();
    }
  }, [search, statusFilter, isNewOrderMode]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrders({
        search,
        status: statusFilter,
      });
      setOrders(data);
      setCurrentPage(1);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      loadOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = () => {
    const headers = [
      { key: 'orderNumber', label: 'Order ID' },
      { key: 'invoiceNumber', label: 'Invoice Number' },
      { key: 'date', label: 'Date' },
      { key: 'customerName', label: 'Customer' },
      { key: 'customerPhone', label: 'Phone' },
      { key: 'paymentMethod', label: 'Payment Mode' },
      { key: 'totalAmount', label: 'Total Amount (INR)' },
      { key: 'status', label: 'Order Status' },
    ];
    exportToCSV('ALTS_Sales_Orders', orders, headers);
    toast.success('Sales orders exported');
  };

  if (isNewOrderMode) {
    return <NewOrderPage />;
  }

  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      title: 'Order & Invoice #',
      key: 'orderNumber',
      render: (val, row) => (
        <div>
          <p className="font-mono font-bold text-maroon-950">{val}</p>
          <p className="font-mono text-[11px] text-gold-700 font-semibold">{row.invoiceNumber}</p>
        </div>
      ),
    },
    {
      title: 'Date & Time',
      key: 'date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val, true)}</span>,
    },
    {
      title: 'Customer (Buyer)',
      key: 'customerName',
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900">{val}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.customerPhone}</p>
        </div>
      ),
    },
    {
      title: 'Sarees Ordered',
      key: 'items',
      render: (items) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {items?.slice(0, 3).map((item, idx) => (
              <img
                key={idx}
                src={item.image}
                alt={item.name}
                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs"
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {items?.reduce((sum, i) => sum + i.quantity, 0)} pcs ({items?.length} items)
          </span>
        </div>
      ),
    },
    {
      title: 'Payment Mode',
      key: 'paymentMethod',
      render: (val) => <span className="text-xs font-medium px-2 py-0.5 rounded bg-cream-200 text-slate-700">{val}</span>,
    },
    {
      title: 'Total Bill',
      key: 'totalAmount',
      render: (val) => (
        <span className="font-bold text-maroon-950 font-brand text-sm">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (val, row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Badge dot>{val}</Badge>
          {isAdmin && val === 'Pending' && (
            <button
              onClick={() => handleStatusChange(row.id, 'Completed')}
              className="text-[11px] font-semibold text-emerald-700 hover:underline"
            >
              Mark Paid
            </button>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'id',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            icon={Receipt}
            onClick={() => setSelectedInvoiceOrder(row)}
          >
            Invoice
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-brand text-xl font-bold text-maroon-950">Sales & Orders Ledger</h1>
            <p className="text-xs text-slate-500">
              Manage retail sales, bridal trousseau bookings, and generate tax invoices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
            disabled={orders.length === 0}
          >
            Export Orders
          </Button>

          <Button
            variant="gold"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/sales?action=new')}
          >
            New Sale (POS)
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-cream-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <Input
            icon={Search}
            placeholder="Search by order #, invoice #, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'New', label: 'New Online' },
              { value: 'Accepted', label: 'Accepted' },
              { value: 'Packed', label: 'Packed' },
              { value: 'Shipped', label: 'Shipped' },
              { value: 'Delivered', label: 'Delivered' },
              { value: 'Completed', label: 'Completed (Store)' },
              { value: 'Pending', label: 'Pending Payment' },
              { value: 'Rejected', label: 'Rejected' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-cream-200 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={paginatedOrders}
          isLoading={isLoading}
          onRowClick={(row) => setSelectedInvoiceOrder(row)}
          emptyTitle="No orders recorded yet"
          emptyDescription="Start a new billing sale using the POS button."
          emptyAction={
            <Button
              variant="gold"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/sales?action=new')}
            >
              Start New Sale
            </Button>
          }
        />
        <Pagination
          currentPage={currentPage}
          totalItems={orders.length}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
        />
      )}
    </div>
  );
};
