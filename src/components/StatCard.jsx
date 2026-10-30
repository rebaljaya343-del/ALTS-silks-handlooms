import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  variant = 'maroon',     // 'maroon' | 'gold' | 'emerald' | 'amber' | 'slate'
  className,
  onClick,
}) => {
  const iconVariants = {
    maroon: 'bg-maroon-50 text-maroon-700 border-maroon-200/80',
    gold: 'bg-gold-50 text-gold-700 border-gold-300/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-300/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const borderAccent = {
    maroon: 'border-l-4 border-l-maroon-700',
    gold: 'border-l-4 border-l-gold-500',
    emerald: 'border-l-4 border-l-emerald-600',
    amber: 'border-l-4 border-l-amber-500',
    slate: 'border-l-4 border-l-slate-400',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white/95 rounded-xl p-5 border border-cream-200 shadow-sm hover:shadow-silk transition-all duration-200',
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        borderAccent[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold font-brand text-maroon-950 tracking-tight">{value}</h4>
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl border', iconVariants[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3.5 pt-3 border-t border-cream-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-medium">
            {trendDirection === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : trendDirection === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            ) : null}
            <span
              className={clsx(
                trendDirection === 'up' && 'text-emerald-700 font-semibold',
                trendDirection === 'down' && 'text-rose-700 font-semibold',
                trendDirection === 'neutral' && 'text-slate-500'
              )}
            >
              {trend}
            </span>
          </div>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
