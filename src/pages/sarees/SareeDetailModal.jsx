import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Scissors,
  Tag,
  CheckCircle,
  AlertTriangle,
  XCircle,
  IndianRupee,
  ShoppingBag,
  Edit2,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../utils/formatters';

export const SareeDetailModal = ({
  isOpen,
  onClose,
  saree,
  onEdit,
  onNewSale,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!saree) return null;

  const images = saree.images && saree.images.length > 0
    ? saree.images
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={saree.name}
      subtitle={`SKU: ${saree.sku} • Category: ${saree.category}`}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Product Images Gallery (5 Cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-gold-400/40 shadow-md bg-cream-100">
            <img
              src={images[activeImageIdx]}
              alt={saree.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImageIdx === idx ? 'border-maroon-700 ring-2 ring-gold-400' : 'border-cream-300 opacity-70'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Detailed Attributes (7 Cols) */}
        <div className="md:col-span-7 space-y-5">
          {/* Price & Stock Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cream-100 to-gold-50/40 border border-gold-300">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Showroom Retail Price</p>
              <h3 className="text-2xl font-bold font-brand text-maroon-950">
                {formatCurrency(saree.price)}
              </h3>
            </div>
            <div className="text-right">
              <Badge size="lg" dot>{saree.status}</Badge>
              <p className="text-xs text-slate-500 mt-1">
                Stock on hand: <span className="font-bold text-maroon-900">{saree.stock} pcs</span>
              </p>
            </div>
          </div>

          {/* Description */}
          {saree.description && (
            <div>
              <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider mb-1">
                Artisan Weave Story
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-cream-200">
                {saree.description}
              </p>
            </div>
          )}

          {/* Technical Attribute Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category & Type</span>
              <span className="font-semibold text-maroon-950 text-sm mt-0.5 block">{saree.category}</span>
            </div>

            <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Fabric Material</span>
              <span className="font-semibold text-maroon-950 text-sm mt-0.5 block">{saree.fabric}</span>
            </div>

            <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary & Border Color</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{saree.color}</span>
            </div>

            <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Craft & Work Technique</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{saree.workType}</span>
            </div>

            <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Occasion</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{saree.occasion}</span>
            </div>

            <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Blouse Piece</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {saree.blousePiece ? 'Included (Unstitched)' : 'Not Included'}
              </span>
            </div>
          </div>

          {saree.blouseDetails && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
              <span className="font-bold">Blouse Note: </span>
              {saree.blouseDetails}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-4 border-t border-cream-200">
            <Button
              variant="outline"
              icon={Edit2}
              onClick={() => {
                onClose();
                onEdit(saree);
              }}
            >
              Edit Details
            </Button>
            <Button
              variant="gold"
              className="flex-1"
              icon={ShoppingBag}
              disabled={saree.stock === 0}
              onClick={() => {
                onClose();
                onNewSale(saree);
              }}
            >
              {saree.stock > 0 ? 'Create Sale with this Saree' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
