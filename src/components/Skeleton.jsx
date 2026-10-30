import React from 'react';
import { clsx } from 'clsx';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200',
        className
      )}
      {...props}
    />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-cream-200 bg-white shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-cream-100">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-cream-50">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={clsx('h-5', cIdx === 0 ? 'w-12' : cIdx === 1 ? 'w-48' : 'w-24')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="rounded-xl border border-cream-200 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-44" />
    </div>
  );
};
