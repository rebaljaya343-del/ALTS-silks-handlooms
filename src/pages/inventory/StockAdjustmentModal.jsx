import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

const adjustmentSchema = yup.object().shape({
  type: yup.string().oneOf(['IN', 'OUT']).required('Adjustment type is required'),
  quantity: yup
    .number()
    .typeError('Quantity must be a positive number')
    .integer('Must be whole number')
    .positive('Quantity must be greater than 0')
    .required('Quantity is required'),
  reason: yup.string().required('Audit reason is required'),
  notes: yup.string().optional(),
});

const IN_REASONS = [
  { value: 'New Mill Arrival', label: 'New Mill Arrival / Weavers Consignment' },
  { value: 'Customer Return', label: 'Customer Return / Exchange' },
  { value: 'Stock Audit Adjustment', label: 'Physical Audit Excess Correction' },
  { value: 'Sample Returned', label: 'Sample / Display Return' },
];

const OUT_REASONS = [
  { value: 'Store Walk-in Sale', label: 'Direct Showroom Sale' },
  { value: 'Damaged / Defect', label: 'Damaged / Zari Snag / Weave Defect' },
  { value: 'Sample Piece Display', label: 'Sent for Exhibition / Display' },
  { value: 'Stock Audit Adjustment', label: 'Physical Audit Shortage Correction' },
];

export const StockAdjustmentModal = ({
  isOpen,
  onClose,
  saree,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(adjustmentSchema),
    defaultValues: {
      type: 'IN',
      quantity: 1,
      reason: 'New Mill Arrival',
      notes: '',
    },
  });

  const adjustmentType = watch('type');

  const handleTypeChange = (type) => {
    setValue('type', type);
    setValue('reason', type === 'IN' ? 'New Mill Arrival' : 'Store Walk-in Sale');
  };

  const handleFormSubmit = (data) => {
    onSubmit({
      sareeId: saree.id,
      type: data.type,
      quantity: Number(data.quantity),
      reason: data.reason,
      notes: data.notes,
    });
  };

  if (!saree) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Inventory Stock"
      subtitle={`Saree: ${saree.name} (${saree.sku})`}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Current Stock Snapshot Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-cream-100 border border-cream-300 text-xs">
          <div>
            <p className="text-slate-500 font-medium">Current Stock on Hand</p>
            <p className="text-xl font-bold font-brand text-maroon-950 mt-0.5">
              {saree.stock} pcs
            </p>
          </div>
          <Badge dot>{saree.status}</Badge>
        </div>

        {/* In / Out Direction Switcher */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-maroon-900/80 block mb-1.5">
            Adjustment Direction
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('IN')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                adjustmentType === 'IN'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/20 shadow-xs'
                  : 'bg-white border-cream-300 text-slate-600 hover:bg-cream-50'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>Stock-IN (+ Add)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('OUT')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                adjustmentType === 'OUT'
                  ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-400/20 shadow-xs'
                  : 'bg-white border-cream-300 text-slate-600 hover:bg-cream-50'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              <span>Stock-OUT (- Deduct)</span>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <Input
          label="Quantity to Adjust (pcs)"
          type="number"
          icon={Boxes}
          required
          placeholder="e.g. 5"
          error={errors.quantity?.message}
          {...register('quantity')}
        />

        {/* Reason */}
        <Select
          label="Audit / Transaction Reason"
          options={adjustmentType === 'IN' ? IN_REASONS : OUT_REASONS}
          required
          error={errors.reason?.message}
          {...register('reason')}
        />

        {/* Notes */}
        <Textarea
          label="Audit Remarks / Challan Reference"
          rows={2}
          placeholder="e.g. Received via master weaver parcel batch #88"
          error={errors.notes?.message}
          {...register('notes')}
        />

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={adjustmentType === 'IN' ? 'primary' : 'danger'}
            isLoading={isLoading}
          >
            {adjustmentType === 'IN' ? 'Confirm Stock-IN' : 'Confirm Stock-OUT'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
