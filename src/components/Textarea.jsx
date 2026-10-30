import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  className,
  id,
  rows = 3,
  required = false,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-maroon-900/80">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={twMerge(
          clsx(
            'block w-full rounded-lg border bg-white/90 px-3.5 py-2 text-sm text-slate-900 transition-all placeholder:text-slate-400',
            'focus:bg-white focus:outline-none focus:ring-2',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-cream-300 hover:border-gold-400 focus:border-gold-500 focus:ring-gold-400/20',
            className
          )
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
