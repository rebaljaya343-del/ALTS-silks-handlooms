import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, Store, UserCircle2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Skeleton } from '../../components/Skeleton';
import { sareeService } from '../../services/sareeService';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

const fallbackImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

export const ShopPage = () => {
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const [sarees, setSarees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [fabric, setFabric] = useState('All');

  useEffect(() => {
    const loadSarees = async () => {
      setIsLoading(true);
      try {
        setSarees(await sareeService.getSarees({ search, category, fabric }));
      } catch {
        toast.error('Failed to load the saree collection');
      } finally {
        setIsLoading(false);
      }
    };
    loadSarees();
  }, [search, category, fabric]);

  const categories = ['All', ...new Set(sarees.map((saree) => saree.category))];
  const fabrics = ['All', ...new Set(sarees.map((saree) => saree.fabric))];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-5 rounded-2xl border border-cream-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-700">
            <Store className="h-4 w-4" /> ALTS Silks storefront
          </div>
          <h1 className="font-brand text-2xl font-bold text-maroon-950">Find your next heirloom</h1>
          <p className="mt-1 text-sm text-slate-500">Browse the latest sarees from our showroom collection.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="outline" icon={UserCircle2} onClick={() => navigate('/shop/orders')}>My Orders</Button>
              <Button variant="outline" icon={LogOut} onClick={() => { logout(); navigate('/login', { replace: true }); }}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/shop/login')}>Customer Login</Button>
              <Button variant="outline" onClick={() => navigate('/shop/signup')}>Sign Up</Button>
            </>
          )}
          <Button variant="outline" icon={ShoppingCart} onClick={() => navigate('/shop/cart')}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-cream-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_220px]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, SKU, category, or fabric" icon={Search} />
        <Select value={category} onChange={(event) => setCategory(event.target.value)} options={categories} placeholder="Category" />
        <Select value={fabric} onChange={(event) => setFabric(event.target.value)} options={fabrics} placeholder="Fabric" />
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-96 rounded-2xl" />)}
        </div>
      ) : sarees.length === 0 ? (
        <div className="rounded-2xl border border-cream-200 bg-white py-12"><EmptyState title="No sarees found" description="Try another search or clear one of the filters." /></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sarees.map((saree) => {
            const outOfStock = saree.stock <= 0;
            return (
              <article key={saree.id} className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
                  <img src={saree.images?.[0] || fallbackImage} alt={saree.name} className="h-full w-full object-cover" />
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${outOfStock ? 'bg-rose-100 text-rose-700' : saree.stock <= (saree.lowStockThreshold || 4) ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {outOfStock ? 'Out of stock' : saree.stock <= (saree.lowStockThreshold || 4) ? `${saree.stock} left` : 'In stock'}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <div><p className="font-brand font-bold text-maroon-950 line-clamp-2">{saree.name}</p><p className="mt-1 text-xs text-slate-500">{saree.category} · {saree.fabric}</p></div>
                  <div className="flex items-center justify-between gap-3"><span className="font-brand text-lg font-bold text-maroon-900">{formatCurrency(saree.price)}</span><Button size="sm" icon={ShoppingCart} disabled={outOfStock} onClick={() => { addToCart(saree); toast.success('Added to cart'); }}>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</Button></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
