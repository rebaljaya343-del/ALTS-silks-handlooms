import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  UserPlus,
  Search,
  Users,
  Download,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
} from 'lucide-react';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { CustomerModal } from './CustomerModal';
import { customerService } from '../../services/customerService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../hooks/useAuth';

export const CustomersListPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerService.getCustomers(search);
      setCustomers(data);
      setCurrentPage(1);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData);
        toast.success('Customer profile updated successfully');
      } else {
        await customerService.createCustomer(formData);
        toast.success('New saree buyer registered successfully');
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (err) {
      toast.error('Error saving customer profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!isAdmin) {
      toast.error('Admin privileges required to delete customer record');
      return;
    }
    if (window.confirm(`Are you sure you want to remove customer record for "${name}"?`)) {
      try {
        await customerService.deleteCustomer(id);
        toast.success('Customer deleted');
        loadCustomers();
      } catch (err) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const handleExport = () => {
    const headers = [
      { key: 'name', label: 'Customer Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'city', label: 'City' },
      { key: 'tier', label: 'Tier' },
      { key: 'totalOrders', label: 'Total Orders' },
      { key: 'totalSpend', label: 'Total Spend (INR)' },
    ];
    exportToCSV('ALTS_Customers', customers, headers);
    toast.success('Exported customer list to CSV');
  };

  const paginatedCustomers = customers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      title: 'Customer Name',
      key: 'name',
      render: (val, row) => (
        <div>
          <p className="font-bold text-maroon-950 hover:text-maroon-700 transition-colors">{val}</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {row.city}
          </p>
        </div>
      ),
    },
    {
      title: 'Contact Details',
      key: 'phone',
      render: (val, row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-medium text-slate-800 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-maroon-700" />
            {val}
          </p>
          {row.email && (
            <p className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {row.email}
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Buyer Tier',
      key: 'tier',
      render: (val) => <Badge dot>{val || 'Regular'}</Badge>,
    },
    {
      title: 'Orders',
      key: 'totalOrders',
      align: 'center',
      render: (val) => (
        <span className="font-semibold text-slate-800 bg-cream-100 px-2.5 py-1 rounded-md text-xs">
          {val || 0} orders
        </span>
      ),
    },
    {
      title: 'Lifetime Spend',
      key: 'totalSpend',
      render: (val) => (
        <span className="font-bold text-maroon-950 font-brand">
          {formatCurrency(val || 0)}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'id',
      align: 'right',
      render: (id, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            title="View Order History & Profile"
            onClick={() => navigate(`/customers/${id}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-maroon-800 hover:bg-cream-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            title="Edit Customer"
            onClick={() => {
              setEditingCustomer(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-gold-700 hover:bg-gold-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              title="Delete Customer"
              onClick={(e) => handleDelete(id, row.name, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-brand text-xl font-bold text-maroon-950">Customer Directory</h1>
            <p className="text-xs text-slate-500">
              Manage bridal trousseau clients, retail walk-ins, and wholesale buyers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
            disabled={customers.length === 0}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
          >
            Add New Customer
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-cream-200 shadow-sm">
        <div className="w-full max-w-md">
          <Input
            icon={Search}
            placeholder="Search customers by name, phone, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 ml-auto">
          <span>Total Registered:</span>
          <span className="font-bold text-maroon-950 font-mono">{customers.length}</span>
        </div>
      </div>

      {/* Table & Pagination */}
      <div className="bg-white rounded-xl border border-cream-200 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={paginatedCustomers}
          isLoading={isLoading}
          onRowClick={(row) => navigate(`/customers/${row.id}`)}
          emptyTitle="No customers found"
          emptyDescription="No customer records match your query. Add a new buyer to get started."
          emptyAction={
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => {
                setEditingCustomer(null);
                setIsModalOpen(true);
              }}
            >
              Add First Customer
            </Button>
          }
        />
        <Pagination
          currentPage={currentPage}
          totalItems={customers.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Customer Modal Form */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingCustomer}
        isLoading={isSubmitting}
      />
    </div>
  );
};
