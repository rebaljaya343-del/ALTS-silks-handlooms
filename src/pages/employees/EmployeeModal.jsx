import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  IndianRupee,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';

const employeeSchema = yup.object().shape({
  name: yup.string().required('Employee name is required').min(2, 'Name too short'),
  role: yup.string().required('Role is required'),
  department: yup.string().required('Department is required'),
  roleType: yup.string().oneOf(['admin', 'staff']).default('staff'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  joiningDate: yup.string().required('Joining date is required'),
  salary: yup.string().optional(),
  status: yup.string().oneOf(['Active', 'On Leave']).default('Active'),
});

const ROLES = [
  { value: 'Store Manager', label: 'Store Manager (Full Admin Access)' },
  { value: 'Master Weaver & Saree Specialist', label: 'Master Weaver & Silk Specialist' },
  { value: 'Senior Sales Executive', label: 'Senior Sales Executive (POS & Catalog)' },
  { value: 'Senior Tailor & Blouse Master', label: 'Senior Tailor & Blouse Master' },
  { value: 'Billing & POS Cashier', label: 'Billing & POS Cashier' },
];

const DEPARTMENTS = [
  { value: 'Management & Operations', label: 'Management & Operations' },
  { value: 'Quality & Sourcing', label: 'Quality & Sourcing' },
  { value: 'Bridal Section', label: 'Bridal Section' },
  { value: 'Custom Fitting & Alterations', label: 'Custom Fitting & Alterations' },
  { value: 'Accounts & Billing', label: 'Accounts & Billing' },
];

export const EmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      name: '',
      role: 'Senior Sales Executive',
      department: 'Bridal Section',
      roleType: 'staff',
      email: '',
      phone: '',
      joiningDate: new Date().toISOString().slice(0, 10),
      salary: '₹40,000 / mo',
      status: 'Active',
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        role: initialData.role || 'Senior Sales Executive',
        department: initialData.department || 'Bridal Section',
        roleType: initialData.roleType || 'staff',
        email: initialData.email || '',
        phone: initialData.phone || '',
        joiningDate: initialData.joiningDate || new Date().toISOString().slice(0, 10),
        salary: initialData.salary || '',
        status: initialData.status || 'Active',
      });
    } else {
      reset({
        name: '',
        role: 'Senior Sales Executive',
        department: 'Bridal Section',
        roleType: 'staff',
        email: '',
        phone: '',
        joiningDate: new Date().toISOString().slice(0, 10),
        salary: '₹40,000 / mo',
        status: 'Active',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleRoleChange = (e) => {
    const roleVal = e.target.value;
    setValue('role', roleVal);
    if (roleVal === 'Store Manager' || roleVal.includes('Manager')) {
      setValue('roleType', 'admin');
    } else {
      setValue('roleType', 'staff');
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Staff Profile' : 'Add New Showroom Staff'}
      subtitle={isEditing ? `Updating ${initialData.name}` : 'Create staff record, designate roles and system permissions'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Staff Full Name"
          icon={User}
          required
          placeholder="e.g. S. Venkatachalam"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Staff Role"
            options={ROLES}
            required
            error={errors.role?.message}
            {...register('role', { onChange: handleRoleChange })}
          />

          <Select
            label="Department"
            options={DEPARTMENTS}
            required
            error={errors.department?.message}
            {...register('department')}
          />
        </div>

        {/* Role Type Access Hint */}
        <div className="p-3 rounded-xl bg-gold-50/50 border border-gold-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-700" />
            <div>
              <p className="font-bold text-maroon-950">
                System Access: {watch('roleType') === 'admin' ? 'Store Administrator' : 'Standard Staff'}
              </p>
              <p className="text-[11px] text-slate-500">
                {watch('roleType') === 'admin'
                  ? 'Can delete products, modify reports, and manage all staff.'
                  : 'Can create POS sales, view catalog, and adjust showroom stock.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Official Email"
            icon={Mail}
            required
            placeholder="staff@alts.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone Number"
            icon={Phone}
            required
            placeholder="+91 98450 12345"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Joining Date"
            type="date"
            icon={Calendar}
            required
            error={errors.joiningDate?.message}
            {...register('joiningDate')}
          />

          <Input
            label="Salary / Retainer"
            icon={IndianRupee}
            placeholder="e.g. ₹40,000 / mo"
            error={errors.salary?.message}
            {...register('salary')}
          />

          <Select
            label="Status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'On Leave', label: 'On Leave' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Staff Details' : 'Register Staff Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
