import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  UserCheck,
  UserPlus,
  Search,
  Download,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { EmployeeModal } from './EmployeeModal';
import { employeeService } from '../../services/employeeService';
import { formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../hooks/useAuth';

export const EmployeesPage = () => {
  const { user, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [search]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getEmployees(search);
      setEmployees(data);
      setCurrentPage(1);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmployee = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, formData);
        toast.success('Employee profile updated');
      } else {
        await employeeService.createEmployee(formData);
        toast.success('New employee registered');
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (err) {
      toast.error('Failed to save employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!isAdmin) {
      toast.error('Admin privileges required to remove staff members');
      return;
    }
    if (window.confirm(`Are you sure you want to remove "${name}" from the employee registry?`)) {
      try {
        await employeeService.deleteEmployee(id);
        toast.success('Employee record removed');
        loadEmployees();
      } catch (err) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleExport = () => {
    const headers = [
      { key: 'name', label: 'Employee Name' },
      { key: 'role', label: 'Role' },
      { key: 'department', label: 'Department' },
      { key: 'roleType', label: 'System Access' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'joiningDate', label: 'Joining Date' },
      { key: 'status', label: 'Status' },
      { key: 'salary', label: 'Salary' },
    ];
    exportToCSV('ALTS_Staff_Directory', employees, headers);
    toast.success('Staff directory exported');
  };

  const paginatedEmployees = employees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      title: 'Employee Name & Role',
      key: 'name',
      render: (val, row) => (
        <div>
          <p className="font-bold text-maroon-950">{val}</p>
          <p className="text-xs text-gold-800 font-semibold">{row.role}</p>
          <p className="text-[10px] text-slate-400">{row.department}</p>
        </div>
      ),
    },
    {
      title: 'System Access Level',
      key: 'roleType',
      render: (val) => (
        <div className="flex items-center gap-1.5">
          {val === 'admin' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-maroon-100 border border-maroon-300 text-maroon-900 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-maroon-700" />
              Store Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              Sales Staff
            </span>
          )}
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
          <p className="text-slate-500 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {row.email}
          </p>
        </div>
      ),
    },
    {
      title: 'Joining Date',
      key: 'joiningDate',
      render: (val) => <span className="text-xs text-slate-700">{formatDate(val)}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <Badge dot>{val}</Badge>,
    },
    {
      title: 'Actions',
      key: 'id',
      align: 'right',
      render: (id, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            title="Edit Employee"
            onClick={() => {
              setEditingEmployee(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-gold-700 hover:bg-gold-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              title="Delete Employee"
              onClick={() => handleDeleteEmployee(id, row.name)}
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
    <div className="space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-brand text-xl font-bold text-maroon-950">Showroom Employees & Staff</h1>
            <p className="text-xs text-slate-500">
              Manage master weavers, sales staff, tailors, cashiers, and role access permissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
            disabled={employees.length === 0}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}
          >
            Add New Staff
          </Button>
        </div>
      </div>

      {/* Role Access Security Notice Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-gold-50 via-cream-100 to-gold-50 border border-gold-300 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-gold-700 flex-shrink-0" />
          <div>
            <span className="font-bold text-maroon-950">Role-Based Access Control Active:</span>
            <span className="text-slate-600 ml-1">
              Store Managers have full administrative powers. Sales staff and tailors have billing and catalog lookup privileges.
            </span>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-cream-200 shadow-sm">
        <div className="w-full max-w-md">
          <Input
            icon={Search}
            placeholder="Search staff by name, role, department, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table & Pagination */}
      <div className="bg-white rounded-xl border border-cream-200 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={paginatedEmployees}
          isLoading={isLoading}
          emptyTitle="No staff members found"
        />
        <Pagination
          currentPage={currentPage}
          totalItems={employees.length}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Employee Modal Form */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleSaveEmployee}
        initialData={editingEmployee}
        isLoading={isSubmitting}
      />
    </div>
  );
};
