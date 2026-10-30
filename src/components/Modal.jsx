import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'lg', // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  footer,
  className,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-[95vw]',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={clsx(
          'relative w-full bg-[#FAF7F2] rounded-2xl shadow-2xl border border-gold-400/40 z-10 overflow-hidden flex flex-col max-h-[90vh] transition-all transform animate-scale-up',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-cream-200 bg-white/90">
          <div>
            {title && (
              <h3 className="text-lg font-bold font-brand text-maroon-950 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4.5 bg-gradient-to-b from-gold-400 to-maroon-700 rounded-full inline-block" />
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 ml-3.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-maroon-800 hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-cream-200 bg-white/80">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
