import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Lock, Mail, Phone, UserRound } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

const schema = yup.object({
  name: yup.string().trim().required('Name is required').min(2, 'Name must be at least 2 characters'),
  phone: yup.string().trim().required('Phone is required').min(10, 'Enter a valid phone number'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

export const CustomerSignupPage = () => {
  const navigate = useNavigate();
  const { register: registerCustomer } = useCustomerAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', phone: '', email: '', password: '' },
  });

  const onSubmit = async (values) => {
    try {
      await registerCustomer({
        name: values.name,
        phone: values.phone,
        email: values.email,
        password: values.password,
      });
      toast.success('Account created successfully');
      navigate('/shop', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to create account');
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-gold-400/40 bg-white p-8 shadow-2xl">
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-maroon-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-maroon-700">
          <UserRound className="h-3.5 w-3.5" /> Create account
        </div>
        <h1 className="font-brand text-3xl font-bold text-maroon-950">Sign up</h1>
        <p className="mt-2 text-sm text-slate-500">Register for a secure self-service shop account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" icon={UserRound} placeholder="Your name" error={errors.name?.message} {...register('name')} />
        <Input label="Phone" icon={Phone} placeholder="9876543210" error={errors.phone?.message} {...register('phone')} />
        <Input label="Email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} icon={Lock} placeholder="Create a password" error={errors.password?.message} {...register('password')} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-9 text-slate-400 hover:text-maroon-900">{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        <Button type="submit" className="w-full" isLoading={isSubmitting}>Create account</Button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-600">
        Already have an account? <Link to="/shop/login" className="font-semibold text-maroon-800 underline">Sign in</Link>
      </div>
    </div>
  );
};
