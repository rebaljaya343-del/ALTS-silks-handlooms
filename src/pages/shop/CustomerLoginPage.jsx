import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Lock, Mail, UserRound } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

const schema = yup.object({
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

export const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useCustomerAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    try {
      await login({ email: values.email, password: values.password });
      toast.success('Signed in successfully');
      const from = location.state?.from?.pathname || '/shop';
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to sign in');
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-gold-400/40 bg-white p-8 shadow-2xl">
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-maroon-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-maroon-700">
          <UserRound className="h-3.5 w-3.5" /> Customer
        </div>
        <h1 className="font-brand text-3xl font-bold text-maroon-950">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to continue your saree order.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} icon={Lock} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-9 text-slate-400 hover:text-maroon-900">{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        <Button type="submit" className="w-full" isLoading={isSubmitting}>Sign in</Button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-600">
        New to ALTS Silks? <Link to="/shop/signup" className="font-semibold text-maroon-800 underline">Create account</Link>
      </div>
    </div>
  );
};
