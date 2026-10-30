import React from 'react';
import {
  Printer,
  Download,
  Share2,
  CheckCircle,
  Sparkles,
  Receipt,
  Store,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const InvoiceModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalItemsCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Showroom Tax Invoice"
      subtitle={`Invoice: ${order.invoiceNumber || 'INV-2026-0841'} • Order: ${order.orderNumber}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400 font-mono">
            Original Copy for Buyer • Computer Generated
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="gold"
              icon={Printer}
              onClick={handlePrint}
            >
              Print Tax Invoice
            </Button>
          </div>
        </div>
      }
    >
      <div className="printable-invoice bg-white p-6 sm:p-8 rounded-2xl border border-cream-300 shadow-sm text-slate-800 space-y-6">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-maroon-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-maroon-950 flex items-center justify-center text-gold-300 font-brand text-2xl border border-gold-400">
              🥻
            </div>
            <div>
              <h2 className="font-brand text-2xl font-bold text-maroon-950 tracking-wide">
                ALTS Silks & Sarees
              </h2>
              <p className="text-xs text-gold-800 font-semibold uppercase tracking-widest">
                Heritage Pure Silk & Bridal Weaves
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                42, Usman Road, T. Nagar, Chennai - 600017 | GSTIN: 33AAAAK1234F1Z5
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-cream-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
            <span className="px-2.5 py-1 rounded-md bg-maroon-900 text-gold-200 font-mono text-xs font-bold">
              TAX INVOICE
            </span>
            <p className="text-xs font-bold text-maroon-950 font-mono mt-1.5">
              #{order.invoiceNumber || 'INV-2026-0841'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center sm:justify-end gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatDate(order.date, true)}
            </p>
          </div>
        </div>

        {/* Bill To & Order Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF7F2] p-4.5 rounded-xl border border-cream-200 text-xs">
          <div>
            <span className="font-bold text-maroon-900 uppercase tracking-wider block mb-1">
              Billed To (Customer):
            </span>
            <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
            <p className="text-slate-600 mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-maroon-700" />
              {order.customerPhone || '+91 98450 12345'}
            </p>
            <p className="text-slate-500 mt-1">
              Chennai Showroom Walk-in / Bridal Collection Delivery
            </p>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="font-bold text-maroon-900 uppercase tracking-wider block mb-1">
              Payment & Order Status:
            </span>
            <p className="text-slate-700">
              Payment Mode:{' '}
              <strong className="text-maroon-950 font-semibold">{order.paymentMethod || 'UPI'}</strong>
            </p>
            <p className="text-slate-700">
              Order Reference:{' '}
              <span className="font-mono font-bold text-gold-800">{order.orderNumber}</span>
            </p>
            <div className="pt-1 flex items-center sm:justify-end">
              <Badge size="sm" dot>{order.status || 'Completed'}</Badge>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto rounded-xl border border-cream-300">
          <table className="w-full text-left text-xs">
            <thead className="bg-maroon-950 text-gold-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">#</th>
                <th className="px-3.5 py-2.5">Saree Description</th>
                <th className="px-3.5 py-2.5">SKU / Weave</th>
                <th className="px-3.5 py-2.5 text-center">Qty</th>
                <th className="px-3.5 py-2.5 text-right">Unit Price</th>
                <th className="px-3.5 py-2.5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {order.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-cream-50/50">
                  <td className="px-3.5 py-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-10 object-cover rounded border border-cream-300 flex-shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.fabric || 'Pure Handloom Silk'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 font-mono font-semibold text-gold-800 text-[11px]">
                    {item.sku || 'SAR-101'}
                  </td>
                  <td className="px-3.5 py-3 text-center font-bold text-slate-800">
                    {item.quantity} pcs
                  </td>
                  <td className="px-3.5 py-3 text-right font-medium text-slate-700">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-3.5 py-3 text-right font-bold text-maroon-950">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
          <div className="text-xs text-slate-500 space-y-1 max-w-sm">
            <p className="font-bold text-maroon-950 uppercase tracking-wider text-[11px]">
              Terms & Saree Care:
            </p>
            <p className="text-[11px] leading-relaxed">
              1. Dry clean only recommended for pure zari & silk sarees.<br />
              2. Exchange allowed within 7 days with intact tags & original invoice.<br />
              3. Certified 100% Silk Mark & Handloom authenticity guaranteed.
            </p>
            {order.notes && (
              <p className="p-2 rounded-lg bg-cream-100 text-slate-700 italic mt-2 text-[11px]">
                <strong>Showroom Notes:</strong> {order.notes}
              </p>
            )}
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs bg-cream-50 p-4 rounded-xl border border-cream-300">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({totalItemsCount} items):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal || order.totalAmount)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Showroom Discount:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>GST (5% Silk Handloom Tax):</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(order.tax || Math.round(order.totalAmount * 0.05))}
              </span>
            </div>

            <div className="pt-2 border-t-2 border-maroon-900/20 flex justify-between items-baseline">
              <span className="font-bold text-maroon-950 text-sm uppercase">Grand Total:</span>
              <span className="font-bold font-brand text-xl text-maroon-950">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div className="pt-8 border-t border-cream-200 flex flex-col sm:flex-row items-end justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gold-600" />
            <span>Thank you for shopping at ALTS Silks!</span>
          </div>
          <div className="text-right">
            <div className="w-40 border-b border-slate-300 pb-1 mb-1"></div>
            <p className="text-[10px] uppercase font-bold text-slate-600">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
