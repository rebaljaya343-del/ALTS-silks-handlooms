import React from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const tax = Math.round(cartTotal * 0.05);

  if (cart.length === 0) {
    return <div className="rounded-2xl border border-cream-200 bg-white py-16"><EmptyState icon={ShoppingBag} title="Your cart is empty" description="Browse the collection and add a saree to begin your order." action={<Button onClick={() => navigate('/shop')}>Browse Sarees</Button>} /></div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-sm font-semibold text-maroon-800 hover:text-gold-700"><ArrowLeft className="h-4 w-4" /> Continue shopping</button>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm"><h1 className="mb-5 font-brand text-2xl font-bold text-maroon-950">Your cart</h1><div className="divide-y divide-cream-100">
          {cart.map((item) => <div key={item.sareeId} className="flex gap-4 py-4 first:pt-0 last:pb-0"><img src={item.image} alt={item.name} className="h-24 w-20 rounded-lg object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><div><h2 className="font-semibold text-maroon-950">{item.name}</h2><p className="mt-1 text-sm text-slate-500">{formatCurrency(item.price)} each</p></div><button title="Remove item" onClick={() => removeFromCart(item.sareeId)} className="h-fit text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div><div className="mt-4 flex items-center justify-between"><div className="flex items-center rounded-lg border border-cream-300"><button className="p-1.5 text-maroon-800 disabled:opacity-40" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.sareeId, item.quantity - 1)}><Minus className="h-3.5 w-3.5" /></button><span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span><button className="p-1.5 text-maroon-800 disabled:opacity-40" disabled={item.quantity >= item.maxStock} onClick={() => updateQuantity(item.sareeId, item.quantity + 1)}><Plus className="h-3.5 w-3.5" /></button></div><span className="font-bold text-maroon-950">{formatCurrency(item.price * item.quantity)}</span></div></div></div>)}
        </div></section>
        <aside className="h-fit rounded-2xl border border-gold-400/50 bg-white p-5 shadow-sm"><h2 className="font-brand text-xl font-bold text-maroon-950">Order summary</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(cartTotal)}</span></div><div className="flex justify-between"><span className="text-slate-500">Tax (5%)</span><span>{formatCurrency(tax)}</span></div><div className="flex justify-between border-t border-cream-200 pt-3 text-base font-bold text-maroon-950"><span>Total</span><span>{formatCurrency(cartTotal + tax)}</span></div></div><Button className="mt-6 w-full" size="lg" onClick={() => navigate('/shop/checkout')}>Proceed to Checkout</Button></aside>
      </div>
    </div>
  );
};
