import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';

const customerSchema = yup.object().shape({
  name: yup.string().required('Customer name is required').min(2, 'Name too short'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9+ -]{8,15}$/, 'Invalid phone number format'),
  email: yup.string().email('Invalid email address').optional(),
  city: yup.string().required('City is required'),
  address: yup.string().optional(),
  tier: yup.string().oneOf(['VIP Bridal', 'Regular', 'Wholesale Buyer']).default('Regular'),
});

export const CustomerModal = ({
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
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      city: 'Chennai',
      address: '',
      tier: 'Regular',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        city: initialData.city || 'Chennai',
        address: initialData.address || '',
        tier: initialData.tier || 'Regular',
      });
    } else {
      reset({
        name: '',
        phone: '',
        email: '',
        city: 'Chennai',
        address: '',
        tier: 'Regular',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Customer Profile' : 'Register New Saree Buyer'}
      subtitle={isEditing ? `Updating ${initialData.name}` : 'Record customer details for order tracking and bridal loyalty'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          icon={User}
          required
          placeholder="e.g. Smt. Lakshmi Narayanan"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone / Mobile"
            icon={Phone}
            required
            placeholder="+91 98450 12345"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Email Address"
            icon={Mail}
            placeholder="lakshmi@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            icon={MapPin}
            required
            placeholder="e.g. Chennai, Bengaluru"
            error={errors.city?.message}
            {...register('city')}
          />

          <Select
            label="Customer Tier / Category"
            options={[
              { value: 'Regular', label: 'Regular Retail Buyer' },
              { value: 'VIP Bridal', label: 'VIP Bridal Trousseau' },
              { value: 'Wholesale Buyer', label: 'Wholesale / Boutique Owner' },
            ]}
            error={errors.tier?.message}
            {...register('tier')}
          />
        </div>

        <Textarea
          label="Postal / Delivery Address"
          rows={2}
          placeholder="Door number, street name, locality, landmark..."
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
