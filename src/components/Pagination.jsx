import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1 && totalItems <= pageSize) {
    return (
      <div className={clsx('flex items-center justify-between px-4 py-3 text-xs text-slate-500', className)}>
        <span>Showing {totalItems} of {totalItems} entries</span>
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white/60 border-t border-cream-200 rounded-b-xl', className)}>
      <div className="text-xs text-slate-500">
        Showing <span className="font-semibold text-maroon-950">{startItem}</span> to{' '}
        <span className="font-semibold text-maroon-950">{endItem}</span> of{' '}
        <span className="font-semibold text-maroon-950">{totalItems}</span> entries
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
        >
          Prev
        </Button>
        
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-xs font-semibold transition-all',
                  currentPage === pageNum
                    ? 'bg-maroon-800 text-gold-200 shadow-sm border border-gold-400/40'
                    : 'bg-white text-slate-700 hover:bg-cream-100 border border-cream-200'
                )}
              >
                {pageNum}
              </button>
            );
          }
          if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
            return <span key={pageNum} className="text-slate-400 px-1 text-xs">...</span>;
          }
          return null;
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
