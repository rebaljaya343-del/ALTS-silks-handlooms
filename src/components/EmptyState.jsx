import React from 'react';
import { Sparkles, PackageOpen } from 'lucide-react';
import { clsx } from 'clsx';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  action,
  className,
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto', className)}>
      <div className="relative mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-cream-100 border border-gold-400/40 text-maroon-700 shadow-inner">
        <Icon className="w-8 h-8" />
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-gold-500 animate-pulse" />
      </div>
      <h3 className="text-base font-bold font-brand text-maroon-950 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
