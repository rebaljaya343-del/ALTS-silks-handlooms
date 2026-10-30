import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({
  children,
  variant = 'default', // 'success' | 'warning' | 'danger' | 'info' | 'blue' | 'indigo' | 'purple' | 'gold' | 'maroon' | 'outline' | 'default'
  size = 'md',        // 'sm' | 'md' | 'lg'
  className,
  dot = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide transition-colors';

  const variants = {
    default: 'bg-cream-200 text-slate-700 border border-cream-300',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-300/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    maroon: 'bg-maroon-50 text-maroon-800 border border-maroon-200 font-semibold',
    gold: 'bg-gold-50 text-gold-900 border border-gold-300 font-semibold',
    outline: 'bg-transparent text-slate-600 border border-slate-300',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  // Helper mapping for common string statuses
  let resolvedVariant = variant;
  const contentStr = String(children || '').trim().toLowerCase();

  if (variant === 'default') {
    if (['in stock', 'completed', 'delivered', 'active', 'paid', 'approved'].includes(contentStr)) {
      resolvedVariant = 'success';
    } else if (['new', 'low stock', 'pending', 'on leave', 'partially paid'].includes(contentStr)) {
      resolvedVariant = 'warning';
    } else if (['accepted'].includes(contentStr)) {
      resolvedVariant = 'blue';
    } else if (['packed'].includes(contentStr)) {
      resolvedVariant = 'indigo';
    } else if (['shipped'].includes(contentStr)) {
      resolvedVariant = 'purple';
    } else if (['out of stock', 'rejected', 'cancelled', 'damaged', 'inactive', 'overdue'].includes(contentStr)) {
      resolvedVariant = 'danger';
    } else if (['admin', 'vip bridal', 'kanjivaram', 'banarasi'].includes(contentStr)) {
      resolvedVariant = 'maroon';
    } else if (['wholesale buyer', 'zari', 'pure silk', 'pattu', 'online'].includes(contentStr)) {
      resolvedVariant = 'gold';
    }
  }

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    danger: 'bg-rose-500',
    maroon: 'bg-maroon-700',
    gold: 'bg-gold-500',
    info: 'bg-sky-500',
    default: 'bg-slate-400',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[resolvedVariant] || variants.default, sizes[size], className))}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            dotColors[resolvedVariant] || 'bg-slate-400'
          )}
        />
      )}
      {children}
    </span>
  );
};
