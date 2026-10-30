import React from 'react';
import { clsx } from 'clsx';
import { TableSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search filters or add a new record.',
  emptyAction,
  onRowClick,
  className,
}) => {
  if (isLoading) {
    return <TableSkeleton columns={columns.length || 5} rows={5} />;
  }

  return (
    <div className={clsx('w-full overflow-hidden rounded-xl border border-cream-200 bg-white shadow-sm', className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-gradient-to-r from-cream-100 via-[#FDFBF7] to-cream-100 border-b border-cream-200 text-xs font-semibold uppercase tracking-wider text-maroon-950">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={clsx(
                    'px-4 py-3.5 whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.headerClassName
                  )}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={clsx(
                    'transition-colors duration-150',
                    onRowClick ? 'cursor-pointer hover:bg-gold-50/30' : 'hover:bg-cream-50/60',
                    rowIdx % 2 === 1 ? 'bg-cream-50/20' : 'bg-white'
                  )}
                >
                  {columns.map((col, colIdx) => {
                    const value = col.render ? col.render(row[col.key], row, rowIdx) : row[col.key];
                    return (
                      <td
                        key={col.key || colIdx}
                        className={clsx(
                          'px-4 py-3.5 whitespace-nowrap align-middle',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          col.className
                        )}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
