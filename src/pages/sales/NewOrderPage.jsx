import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  UserPlus,
  Phone,
  IndianRupee,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Receipt,
  Boxes,
} from 'lucide-react';
import { sareeService } from '../../services/sareeService';
import { customerService } from '../../services/customerService';
import { orderService } from '../../services/orderService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { CustomerModal } from '../customers/CustomerModal';
import { InvoiceModal } from './InvoiceModal';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const NewOrderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Saree Catalog & Cart
  const [sarees, setSarees] = useState([]);
  const [sareeSearch, setSareeSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState([]);

  // Customer State
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(searchParams.get('customerId') || '');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Billing calculation
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [orderNotes, setOrderNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Invoice view after creation
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, [sareeSearch, selectedCategory]);

  const loadData = async () => {
    try {
      const [sareeList, customerList] = await Promise.all([
        sareeService.getSarees({ search: sareeSearch, category: selectedCategory }),
        customerService.getCustomers(),
      ]);
      setSarees(sareeList);
      setCustomers(customerList);

      // If URL has sareeId, pre-add to cart
      const preselectSareeId = searchParams.get('sareeId');
      if (preselectSareeId && cartItems.length === 0) {
        const itemToAdd = sareeList.find((s) => s.id === preselectSareeId);
        if (itemToAdd && itemToAdd.stock > 0) {
          addToCart(itemToAdd);
        }
      }
    } catch (err) {
      toast.error('Failed to load catalog data');
    }
  };

  const addToCart = (saree) => {
    if (saree.stock <= 0) {
      toast.error('This saree is currently out of stock');
      return;
    }

    const existingIndex = cartItems.findIndex((item) => item.sareeId === saree.id);
    if (existingIndex > -1) {
      if (cartItems[existingIndex].quantity >= saree.stock) {
        toast.error(`Only ${saree.stock} pieces available in stock`);
        return;
      }
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
      toast.success(`Added another ${saree.name} to bill`);
    } else {
      setCartItems([
        ...cartItems,
        {
          sareeId: saree.id,
          name: saree.name,
          sku: saree.sku,
          category: saree.category,
          fabric: saree.fabric,
          price: saree.price,
          stock: saree.stock,
          quantity: 1,
          image: saree.images?.[0],
        },
      ]);
      toast.success(`${saree.name} added to bill`);
    }
  };

  const updateQuantity = (sareeId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.sareeId === sareeId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              toast.error(`Maximum available stock is ${item.stock}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (sareeId) => {
    setCartItems(cartItems.filter((i) => i.sareeId !== sareeId));
  };

  const handleQuickCustomerCreated = async (customerData) => {
    try {
      const newCust = await customerService.createCustomer(customerData);
      setCustomers([newCust, ...customers]);
      setSelectedCustomerId(newCust.id);
      setIsCustomerModalOpen(false);
      toast.success(`Customer ${newCust.name} selected for billing`);
    } catch (err) {
      toast.error('Failed to save customer');
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const numDiscount = Number(discount) || 0;
  const discountedSubtotal = Math.max(0, subtotal - numDiscount);
  const tax = Math.round(discountedSubtotal * 0.05); // 5% GST on Sarees
  const grandTotal = discountedSubtotal + tax;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Please add at least one saree to bill');
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const customerName = selectedCustomer ? selectedCustomer.name : 'Walk-in Cash Guest';
    const customerPhone = selectedCustomer ? selectedCustomer.phone : '+91 Walk-in';

    try {
      setIsPlacingOrder(true);
      const newOrder = await orderService.createOrder({
        customerId: selectedCustomerId || null,
        customerName,
        customerPhone,
        items: cartItems,
        discount: numDiscount,
        paymentMethod,
        notes: orderNotes,
        staffName: user?.name || 'Showroom Executive',
      });

      toast.success(`Order ${newOrder.orderNumber} placed successfully!`);
      setCreatedOrder(newOrder);
      setCartItems([]);
      setDiscount(0);
      setOrderNotes('');
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/sales')}
          >
            Back to Orders
          </Button>
          <div>
            <h1 className="font-brand text-2xl font-bold text-maroon-950">
              Showroom POS & Billing Counter
            </h1>
            <p className="text-xs text-slate-500">
              Select customer, add handloom sarees, apply discount, and generate tax invoice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge size="lg" dot>
            Cashier: {user?.name || 'Active Counter'}
          </Badge>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Saree Catalog Picker (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  icon={Search}
                  placeholder="Scan SKU or search saree name..."
                  value={sareeSearch}
                  onChange={(e) => setSareeSearch(e.target.value)}
                />
              </div>

              <Select
                options={[
                  { value: 'All', label: 'All Weaves' },
                  { value: 'Kanjivaram', label: 'Kanjivaram' },
                  { value: 'Banarasi', label: 'Banarasi' },
                  { value: 'Pattu', label: 'Pure Silk' },
                  { value: 'Cotton', label: 'Cotton' },
                  { value: 'Organza', label: 'Organza' },
                  { value: 'Chanderi', label: 'Chanderi' },
                  { value: 'Tussar', label: 'Tussar' },
                ]}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Saree Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1">
            {sarees.map((saree) => {
              const inCart = cartItems.find((i) => i.sareeId === saree.id);
              return (
                <div
                  key={saree.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-3.5 flex flex-col justify-between shadow-sm ${
                    inCart
                      ? 'border-gold-500 bg-gold-50/20 ring-1 ring-gold-400'
                      : 'border-cream-200 hover:border-gold-400 hover:shadow-silk'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-20 rounded-xl overflow-hidden border border-cream-300 bg-cream-100 flex-shrink-0 shadow-xs">
                      <img
                        src={saree.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                        alt={saree.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-maroon-50 text-maroon-900 border border-maroon-200">
                          {saree.sku}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{saree.category}</span>
                      </div>
                      <h4 className="font-bold text-xs text-maroon-950 mt-1 line-clamp-1">{saree.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{saree.fabric} • {saree.color}</p>
                      <p className="font-bold font-brand text-sm text-maroon-950 mt-1">
                        {formatCurrency(saree.price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-cream-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      <Boxes className="w-3 h-3 text-gold-600" />
                      {saree.stock} in stock
                    </span>

                    <Button
                      variant={inCart ? 'gold' : 'primary'}
                      size="sm"
                      disabled={saree.stock === 0}
                      onClick={() => addToCart(saree)}
                      className="text-xs py-1"
                    >
                      {saree.stock === 0 ? 'Out of Stock' : inCart ? `Added (${inCart.quantity})` : '+ Add to Bill'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Checkout & Billing Cart Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-cream-200 shadow-md p-5 space-y-5">
          {/* Customer Selection Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-maroon-950 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-maroon-700" />
                Select Customer (Buyer)
              </label>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="text-xs font-semibold text-gold-700 hover:text-maroon-900 flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3 h-3" /> + New Customer
              </button>
            </div>

            <Select
              placeholder="Walk-in Cash Guest / Select Registered Customer"
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.phone}) - ${c.tier || 'Regular'}`,
              }))}
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            />
          </div>

          {/* Cart Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-cream-200 text-xs font-bold uppercase tracking-wider text-maroon-950">
              <span>Items on Bill ({cartItems.length})</span>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  className="text-[11px] text-rose-600 font-semibold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.sareeId}
                    className="p-2.5 rounded-xl bg-cream-50/70 border border-cream-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.sku} • {formatCurrency(item.price)} each
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-white rounded-lg border border-cream-300 p-1 shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.sareeId, -1)}
                        className="p-1 rounded hover:bg-cream-100 text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-maroon-950 w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.sareeId, 1)}
                        className="p-1 rounded hover:bg-cream-100 text-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="font-bold font-brand text-maroon-950 w-20 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.sareeId)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  <ShoppingBag className="w-8 h-8 text-cream-400 mx-auto mb-1 opacity-60" />
                  No sarees added yet. Click "+ Add to Bill" from catalog.
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2 border-t border-cream-200">
            <label className="text-xs font-bold uppercase tracking-wider text-maroon-950 block">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'UPI', label: 'UPI / GPay', icon: Smartphone },
                { id: 'Credit/Debit Card', label: 'Card POS', icon: CreditCard },
                { id: 'Cash', label: 'Cash', icon: Banknote },
                { id: 'Net Banking', label: 'NEFT / Wire', icon: Building },
              ].map((pm) => {
                const Icon = pm.icon;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                      paymentMethod === pm.id
                        ? 'bg-maroon-800 text-gold-200 border-gold-400 shadow-sm ring-1 ring-gold-400/40'
                        : 'bg-cream-50 text-slate-700 border-cream-200 hover:bg-cream-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discount & Notes */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Input
              label="Showroom Discount (₹)"
              type="number"
              placeholder="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <Input
              label="Order Notes / Packing"
              placeholder="e.g. Bridal gift box packaging"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>

          {/* Bill Summary Calculations */}
          <div className="p-4 rounded-xl bg-cream-100/70 border border-cream-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            {numDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(numDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST (5% Silk Handloom Tax):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
            </div>
            <div className="pt-2 border-t border-maroon-900/20 flex justify-between items-baseline">
              <span className="font-bold text-sm text-maroon-950 uppercase">Grand Total:</span>
              <span className="font-bold font-brand text-2xl text-maroon-950">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Place Order CTA Button */}
          <Button
            variant="gold"
            size="lg"
            className="w-full text-base py-3 shadow-md"
            icon={Receipt}
            isLoading={isPlacingOrder}
            disabled={cartItems.length === 0}
            onClick={handlePlaceOrder}
          >
            Confirm & Generate Tax Invoice ({formatCurrency(grandTotal)})
          </Button>
        </div>
      </div>

      {/* Customer Quick Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleQuickCustomerCreated}
      />

      {/* Success Invoice Modal */}
      {createdOrder && (
        <InvoiceModal
          isOpen={!!createdOrder}
          onClose={() => {
            setCreatedOrder(null);
            navigate('/sales');
          }}
          order={createdOrder}
        />
      )}
    </div>
  );
};
