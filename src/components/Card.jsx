import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className,
  title,
  subtitle,
  action,
  footer,
  hoverable = false,
  bordered = true,
  variant = 'default', // 'default' | 'gold' | 'maroon' | 'glass'
  ...props
}) => {
  const variants = {
    default: 'bg-white/95 text-slate-800',
    glass: 'bg-white/80 backdrop-blur-md text-slate-800',
    gold: 'bg-gradient-to-br from-white via-gold-50/20 to-gold-100/40 border-gold-300',
    maroon: 'bg-gradient-to-br from-maroon-900 to-maroon-950 text-white border-maroon-700',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-xl transition-all duration-200',
          bordered && 'border border-cream-200/90 shadow-sm shadow-cream-900/5',
          hoverable && 'hover:shadow-silk-lg hover:-translate-y-0.5 hover:border-gold-400/60',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200/70">
          <div>
            {title && <h3 className="font-brand text-base font-semibold text-maroon-950 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-cream-50/50 rounded-b-xl border-t border-cream-200/70">
          {footer}
        </div>
      )}
    </div>
  );
};
