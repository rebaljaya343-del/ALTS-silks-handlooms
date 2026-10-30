import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  Layers,
  Tag,
  IndianRupee,
  Boxes,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';
import { generateSKU } from '../../utils/formatters';

const CATEGORIES = [
  'Kanjivaram',
  'Banarasi',
  'Pattu',
  'Cotton',
  'Chanderi',
  'Organza',
  'Tussar',
  'Georgette',
  'Paithani',
];

const FABRICS = [
  'Pure Mulberry Silk',
  'Katan Silk',
  'Soft Silk',
  'Pure Silk',
  'Mulmul Cotton',
  'Silk Cotton',
  'Organza Silk',
  'Pure Tussar Silk',
  'Pure Georgette',
  'Crepe Silk',
];

const WORK_TYPES = [
  'Pure Zari Weaving',
  'Brocade Handloom',
  'Kadwa Weave',
  'Cutwork Embroidery',
  'Handloom Ikat',
  'Hand Block Print',
  'Kantha Embroidery',
  'Chikankari & Mukaish',
  'Plain with Zari Border',
];

const OCCASIONS = [
  'Bridal',
  'Festive',
  'Traditional',
  'Party Wear',
  'Casual',
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1610030469668-932d568c0780?auto=format&fit=crop&w=800&q=80',
];

const sareeSchema = yup.object().shape({
  name: yup.string().required('Saree name is required').min(3, 'Name too short'),
  sku: yup.string().required('SKU/Code is required'),
  category: yup.string().required('Category is required'),
  fabric: yup.string().required('Fabric type is required'),
  color: yup.string().required('Color is required'),
  blousePiece: yup.boolean().default(true),
  blouseDetails: yup.string().optional(),
  workType: yup.string().required('Work type is required'),
  occasion: yup.string().required('Occasion tag is required'),
  price: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be greater than 0')
    .required('Selling price is required'),
  costPrice: yup
    .number()
    .typeError('Cost price must be a number')
    .positive('Cost price must be greater than 0')
    .optional(),
  stock: yup
    .number()
    .typeError('Stock must be a number')
    .min(0, 'Stock cannot be negative')
    .required('Stock quantity is required'),
  lowStockThreshold: yup
    .number()
    .typeError('Threshold must be a number')
    .min(1, 'Minimum threshold is 1')
    .default(4),
  description: yup.string().optional(),
});

export const SareeFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = !!initialData;
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(sareeSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: 'Kanjivaram',
      fabric: 'Pure Mulberry Silk',
      color: 'Crimson Red & Gold',
      blousePiece: true,
      blouseDetails: 'Unstitched matching blouse piece included (80cm)',
      workType: 'Pure Zari Weaving',
      occasion: 'Bridal',
      price: '',
      costPrice: '',
      stock: 5,
      lowStockThreshold: 4,
      description: '',
    },
  });

  const selectedCategory = watch('category');
  const hasBlousePiece = watch('blousePiece');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || 'Kanjivaram',
        fabric: initialData.fabric || 'Pure Mulberry Silk',
        color: initialData.color || '',
        blousePiece: initialData.blousePiece !== undefined ? initialData.blousePiece : true,
        blouseDetails: initialData.blouseDetails || '',
        workType: initialData.workType || 'Pure Zari Weaving',
        occasion: initialData.occasion || 'Bridal',
        price: initialData.price || '',
        costPrice: initialData.costPrice || '',
        stock: initialData.stock !== undefined ? initialData.stock : 5,
        lowStockThreshold: initialData.lowStockThreshold || 4,
        description: initialData.description || '',
      });
      setImages(initialData.images || [SAMPLE_IMAGES[0]]);
    } else {
      const generated = generateSKU('KAN');
      reset({
        name: '',
        sku: generated,
        category: 'Kanjivaram',
        fabric: 'Pure Mulberry Silk',
        color: 'Crimson Red & Gold',
        blousePiece: true,
        blouseDetails: 'Unstitched matching blouse piece included (80cm)',
        workType: 'Pure Zari Weaving',
        occasion: 'Bridal',
        price: '',
        costPrice: '',
        stock: 5,
        lowStockThreshold: 4,
        description: '',
      });
      setImages([SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)]]);
    }
  }, [initialData, reset, isOpen]);

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setValue('category', cat);
    if (!isEditing) {
      setValue('sku', generateSKU(cat));
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    } else {
      // Add random preset sample image
      const nextImg = SAMPLE_IMAGES[(images.length) % SAMPLE_IMAGES.length];
      setImages([...images, nextImg]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      images: images.length > 0 ? images : [SAMPLE_IMAGES[0]],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Saree Product' : 'Add New Saree to Catalog'}
      subtitle={isEditing ? `Modifying SKU: ${initialData?.sku}` : 'Add product details, fabric composition, pricing, and stock'}
      size="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider pb-2 border-b border-cream-200">
            1. Saree Information & Weave Classification
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Saree Name"
                placeholder="e.g. Kanjivaram Pure Zari Bridal Silk Saree"
                required
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div>
              <Input
                label="SKU / Product Code"
                placeholder="e.g. KAN-101"
                required
                error={errors.sku?.message}
                {...register('sku')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Saree Category / Type"
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              required
              error={errors.category?.message}
              {...register('category', { onChange: handleCategoryChange })}
            />

            <Select
              label="Fabric Type"
              options={FABRICS.map((f) => ({ value: f, label: f }))}
              required
              error={errors.fabric?.message}
              {...register('fabric')}
            />

            <Input
              label="Primary & Border Color"
              placeholder="e.g. Crimson Red & Zari Gold"
              required
              error={errors.color?.message}
              {...register('color')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Work / Weave Technique"
              options={WORK_TYPES.map((w) => ({ value: w, label: w }))}
              required
              error={errors.workType?.message}
              {...register('workType')}
            />

            <Select
              label="Occasion Tag"
              options={OCCASIONS.map((o) => ({ value: o, label: o }))}
              required
              error={errors.occasion?.message}
              {...register('occasion')}
            />
          </div>
        </div>

        {/* Section 2: Blouse & Description */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider pb-2 border-b border-cream-200">
            2. Blouse & Craft Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="space-y-1 sm:col-span-1 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-maroon-900/80 block">
                Blouse Piece Included?
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="true"
                    checked={hasBlousePiece === true}
                    onChange={() => setValue('blousePiece', true)}
                    className="text-maroon-800 focus:ring-maroon-600"
                  />
                  <span>Yes, Included</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="false"
                    checked={hasBlousePiece === false}
                    onChange={() => setValue('blousePiece', false)}
                    className="text-maroon-800 focus:ring-maroon-600"
                  />
                  <span>No Blouse</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Blouse Piece Details"
                placeholder="e.g. Unstitched 80cm brocade silk matching blouse"
                disabled={!hasBlousePiece}
                error={errors.blouseDetails?.message}
                {...register('blouseDetails')}
              />
            </div>
          </div>

          <Textarea
            label="Product Description / Weavers Notes"
            rows={2}
            placeholder="Describe the zari composition, temple border heritage, motifs, or special care instructions..."
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        {/* Section 3: Pricing & Inventory */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider pb-2 border-b border-cream-200">
            3. Pricing & Inventory Controls
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              label="Selling Price (₹)"
              type="number"
              icon={IndianRupee}
              required
              placeholder="e.g. 38500"
              error={errors.price?.message}
              {...register('price')}
            />

            <Input
              label="Cost Price (₹)"
              type="number"
              icon={IndianRupee}
              placeholder="e.g. 26000"
              helperText="For profit margin reports"
              error={errors.costPrice?.message}
              {...register('costPrice')}
            />

            <Input
              label="Stock Quantity (pcs)"
              type="number"
              icon={Boxes}
              required
              placeholder="e.g. 8"
              error={errors.stock?.message}
              {...register('stock')}
            />

            <Input
              label="Low-Stock Alert Level"
              type="number"
              placeholder="e.g. 4"
              helperText="Triggers dashboard warning"
              error={errors.lowStockThreshold?.message}
              {...register('lowStockThreshold')}
            />
          </div>
        </div>

        {/* Section 4: Image Uploads / Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-cream-200">
            <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider">
              4. Saree Gallery Photos ({images.length})
            </h4>
            <button
              type="button"
              onClick={handleAddImage}
              className="text-xs font-semibold text-gold-700 hover:text-maroon-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Sample Photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative h-28 rounded-xl overflow-hidden border border-cream-300 bg-cream-100 shadow-sm"
              >
                <img src={imgUrl} alt={`Saree photo ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-maroon-950/80 text-[10px] text-gold-300 font-semibold backdrop-blur-xs">
                    Primary Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Saree Changes' : 'Publish Saree to Catalog'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
