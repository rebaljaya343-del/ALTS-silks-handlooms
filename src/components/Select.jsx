import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  icon: Icon,
  className,
  id,
  placeholder = 'Select an option',
  required = false,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-maroon-900/80">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-maroon-700/50">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <select
          ref={ref}
          id={selectId}
          className={twMerge(
            clsx(
              'block w-full rounded-lg border bg-white/90 text-sm text-slate-900 transition-all cursor-pointer',
              'focus:bg-white focus:outline-none focus:ring-2 appearance-none pr-8',
              Icon ? 'pl-9 py-2' : 'px-3.5 py-2',
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                : 'border-cream-300 hover:border-gold-400 focus:border-gold-500 focus:ring-gold-400/20',
              className
            )
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children || options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
