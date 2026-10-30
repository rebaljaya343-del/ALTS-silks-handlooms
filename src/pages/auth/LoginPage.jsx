import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  Store,
  Crown,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

const loginSchema = yup.object().shape({
  emailOrUsername: yup
    .string()
    .required('Email or Username is required')
    .min(3, 'Must be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(4, 'Password must be at least 4 characters'),
  rememberMe: yup.boolean().default(true),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      emailOrUsername: 'admin@alts.com',
      password: 'admin123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await login(data.emailOrUsername, data.password, data.rememberMe);
      toast.success('Welcome back to ALTS Silks Portal');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error('Invalid credentials. Please check and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (type) => {
    if (type === 'admin') {
      setValue('emailOrUsername', DEMO_USERS.admin.email);
      setValue('password', 'admin123');
    } else {
      setValue('emailOrUsername', DEMO_USERS.staff.email);
      setValue('password', 'staff123');
    }
    handleSubmit(onSubmit)();
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gold-400/40 grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
      {/* Left Banner Showcase (5 Cols) */}
      <div className="lg:col-span-5 bg-gradient-to-br from-maroon-950 via-maroon-900 to-[#35020D] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-600 p-0.5 shadow-gold-glow flex items-center justify-center">
              <div className="w-full h-full bg-maroon-950 rounded-[14px] flex items-center justify-center text-2xl">
                🥻
              </div>
            </div>
            <div>
              <h2 className="font-brand font-bold text-2xl tracking-wide text-gold-200">ALTS</h2>
              <p className="text-xs font-semibold tracking-widest text-gold-400/90 uppercase">Silks & Handlooms</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-400/30 text-gold-300 text-xs font-medium">
              <Crown className="w-3.5 h-3.5 text-gold-400" />
              <span>Heritage ERP & POS Suite</span>
            </div>
            <h3 className="font-brand text-2xl sm:text-3xl font-bold leading-snug text-cream-100">
              Preserving the Weaving Legacy with Modern Intelligence
            </h3>
            <p className="text-xs text-cream-300/80 leading-relaxed">
              Unified management for Kanjivaram Bridal Silks, Banarasi Brocades, Handloom Cottons, inventory audit, and multi-channel billing.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 pt-8 border-t border-gold-500/20 grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="font-semibold text-gold-300">₹4.8 Cr+</p>
            <p className="text-[11px] text-cream-300/70">Inventory Tracked</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="font-semibold text-gold-300">12,500+</p>
            <p className="text-[11px] text-cream-300/70">Bridal Customers</p>
          </div>
        </div>
      </div>

      {/* Right Login Form (7 Cols) */}
      <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[#FAF7F2]">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-maroon-700 bg-maroon-50 px-2.5 py-1 rounded-md border border-maroon-200">
              Staff & Admin Portal
            </span>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-maroon-950 mt-2">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials or click a quick login demo profile below.
            </p>
          </div>

          {/* Quick Login One-Click Pills */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Demo Login:</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gold-400/80 hover:bg-gold-50/50 hover:border-gold-500 text-left transition-all shadow-sm group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-maroon-50 text-maroon-800 group-hover:bg-maroon-800 group-hover:text-gold-200 transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-maroon-950 truncate">Store Director</p>
                  <p className="text-[10px] text-slate-500">Full Admin Role</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-cream-300 hover:bg-cream-100/70 hover:border-slate-400 text-left transition-all shadow-sm group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-800 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-maroon-950 truncate">Sales Staff</p>
                  <p className="text-[10px] text-slate-500">POS & Catalog</p>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-cream-300"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or with credentials
            </span>
            <div className="flex-grow border-t border-cream-300"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email or Username"
              icon={Mail}
              placeholder="e.g. admin@alts.com"
              error={errors.emailOrUsername?.message}
              {...register('emailOrUsername')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-slate-400 hover:text-maroon-900 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded border-cream-300 text-maroon-800 focus:ring-maroon-600 w-4 h-4"
                />
                <span>Remember this workstation</span>
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast('Password reset link sent to registered owner mobile.', { icon: '📱' });
                }}
                className="font-medium text-maroon-800 hover:text-gold-700 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In to Management Portal
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-gold-300 bg-gold-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon-700">Customer access</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => window.location.href = '/shop/login'} className="flex-1">
                Customer Login
              </Button>
              <Button type="button" variant="outline" onClick={() => window.location.href = '/shop/signup'} className="flex-1">
                Customer Signup
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            Protected by ALTS Silks Enterprise Security &copy; 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
