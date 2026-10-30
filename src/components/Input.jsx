import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className,
  id,
  type = 'text',
  required = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-maroon-900/80">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-maroon-700/50">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={twMerge(
            clsx(
              'block w-full rounded-lg border bg-white/90 text-sm text-slate-900 transition-all placeholder:text-slate-400',
              'focus:bg-white focus:outline-none focus:ring-2',
              Icon ? 'pl-9 pr-3 py-2' : 'px-3.5 py-2',
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                : 'border-cream-300 hover:border-gold-400 focus:border-gold-500 focus:ring-gold-400/20',
              className
            )
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
