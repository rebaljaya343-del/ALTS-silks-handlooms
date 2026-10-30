import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold'
  size = 'md',       // 'sm' | 'md' | 'lg' | 'icon'
  isLoading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-55 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-maroon-700 via-maroon-800 to-maroon-900 text-gold-100 hover:from-maroon-800 hover:to-maroon-950 focus:ring-maroon-600 shadow-md hover:shadow-silk border border-gold-500/30',
    gold: 'bg-gradient-to-r from-gold-500 to-gold-600 text-maroon-950 font-semibold hover:from-gold-400 hover:to-gold-500 focus:ring-gold-400 shadow-md shadow-gold-500/20 border border-gold-300',
    secondary: 'bg-cream-100 text-maroon-900 hover:bg-cream-200 border border-cream-300 focus:ring-maroon-400',
    outline: 'bg-transparent text-maroon-800 hover:bg-maroon-50 border border-maroon-300 focus:ring-maroon-500',
    ghost: 'bg-transparent text-slate-700 hover:bg-cream-200/70 hover:text-maroon-900 focus:ring-slate-400',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
    icon: 'p-2',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {Icon && <Icon className={clsx(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />}
          {children}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
