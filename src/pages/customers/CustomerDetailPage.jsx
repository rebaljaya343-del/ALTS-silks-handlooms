import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  IndianRupee,
  Receipt,
  Eye,
  Plus,
  Crown,
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceModal } from '../sales/InvoiceModal';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadCustomerProfile();
  }, [id]);

  const loadCustomerProfile = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getCustomerById(id);
      setCustomer(data);
    } catch (err) {
      toast.error('Customer not found');
      navigate('/customers');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-maroon-700 rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Loading customer history...</p>
      </div>
    );
  }

  if (!customer) return null;

  const ordersColumns = [
    {
      title: 'Order ID',
      key: 'orderNumber',
      render: (val) => <span className="font-mono font-bold text-maroon-900">{val}</span>,
    },
    {
      title: 'Date',
      key: 'date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val, true)}</span>,
    },
    {
      title: 'Sarees Purchased',
      key: 'items',
      render: (items) => (
        <div className="space-y-1">
          {items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-900">{item.name}</span>
              <span className="text-slate-400 font-mono">({item.sku})</span>
              <span className="px-1.5 py-0.2 rounded bg-cream-200 text-maroon-950 font-bold text-[10px]">
                x{item.quantity}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Payment Mode',
      key: 'paymentMethod',
      render: (val) => <span className="text-xs px-2 py-0.5 rounded bg-cream-100 font-medium text-slate-700">{val}</span>,
    },
    {
      title: 'Total Bill',
      key: 'totalAmount',
      render: (val) => <span className="font-bold text-maroon-950">{formatCurrency(val)}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <Badge dot>{val}</Badge>,
    },
    {
      title: 'Invoice',
      key: 'id',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Receipt}
          onClick={() => setSelectedInvoice(row)}
        >
          View Tax Invoice
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/customers')}
        >
          Back to Customers
        </Button>

        <Button
          variant="gold"
          size="sm"
          icon={Plus}
          onClick={() => navigate(`/sales?customerId=${customer.id}`)}
        >
          Create New Order for {customer.name.split(' ')[0]}
        </Button>
      </div>

      {/* Customer Profile Header Card */}
      <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-brand text-2xl font-bold text-maroon-950">{customer.name}</h1>
              <Badge dot>{customer.tier || 'Regular'}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-maroon-700" />
                {customer.phone}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {customer.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {customer.city}
              </span>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 text-center">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
              <p className="text-lg font-bold text-maroon-950 font-brand mt-0.5">
                {customer.orders?.length || customer.totalOrders || 0}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-gold-50/60 border border-gold-200/80 text-center">
              <p className="text-[11px] font-semibold text-gold-800 uppercase tracking-wider">Lifetime Spend</p>
              <p className="text-lg font-bold text-maroon-950 font-brand mt-0.5">
                {formatCurrency(customer.totalSpend || 0)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 text-center col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Customer Since</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {customer.address && (
          <div className="mt-5 pt-4 border-t border-cream-100 flex items-start gap-2 text-xs text-slate-600">
            <span className="font-semibold text-maroon-950">Billing / Delivery Address:</span>
            <span>{customer.address}, {customer.city}</span>
          </div>
        )}
      </div>

      {/* Order History Section */}
      <Card
        title={`Order History (${customer.orders?.length || 0})`}
        subtitle="All past saree purchases, tax invoices, and payment statuses"
      >
        <Table
          columns={ordersColumns}
          data={customer.orders || []}
          emptyTitle="No past orders found"
          emptyDescription="This customer has not made any purchases yet."
          emptyAction={
            <Button
              variant="primary"
              size="sm"
              icon={ShoppingBag}
              onClick={() => navigate(`/sales?customerId=${customer.id}`)}
            >
              Create First Sale
            </Button>
          }
        />
      </Card>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          order={selectedInvoice}
        />
      )}
    </div>
  );
};
