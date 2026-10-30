import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Boxes,
  Sparkles,
  Scissors,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { SareeFormModal } from './SareeFormModal';
import { SareeDetailModal } from './SareeDetailModal';
import { sareeService } from '../../services/sareeService';
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../hooks/useAuth';

export const SareesListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [sarees, setSarees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFabric, setSelectedFabric] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [maxPrice, setMaxPrice] = useState(50000);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === 'grid' ? 8 : 6;

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSaree, setEditingSaree] = useState(null);
  const [viewingSaree, setViewingSaree] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if opened with ?action=new
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setEditingSaree(null);
      setIsFormModalOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    loadSarees();
  }, [search, selectedCategory, selectedFabric, selectedStatus, selectedOccasion, maxPrice]);

  const loadSarees = async () => {
    try {
      setIsLoading(true);
      const data = await sareeService.getSarees({
        search,
        category: selectedCategory,
        fabric: selectedFabric,
        status: selectedStatus,
        occasion: selectedOccasion,
        minPrice: 0,
        maxPrice,
      });
      setSarees(data);
      setCurrentPage(1);
    } catch (err) {
      toast.error('Failed to load saree products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSaree = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingSaree) {
        await sareeService.updateSaree(editingSaree.id, formData);
        toast.success('Saree details updated successfully');
      } else {
        await sareeService.createSaree(formData);
        toast.success('New saree added to showroom catalog');
      }
      setIsFormModalOpen(false);
      setEditingSaree(null);
      loadSarees();
    } catch (err) {
      toast.error('Error saving saree');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSaree = async (id, name, e) => {
    e.stopPropagation();
    if (!isAdmin) {
      toast.error('Only Store Admins can delete sarees from catalog');
      return;
    }
    if (window.confirm(`Are you sure you want to remove "${name}" from catalog?`)) {
      try {
        await sareeService.deleteSaree(id);
        toast.success('Saree removed');
        loadSarees();
      } catch (err) {
        toast.error('Failed to delete saree');
      }
    }
  };

  const handleExport = () => {
    const headers = [
      { key: 'sku', label: 'SKU Code' },
      { key: 'name', label: 'Saree Name' },
      { key: 'category', label: 'Category' },
      { key: 'fabric', label: 'Fabric' },
      { key: 'color', label: 'Color' },
      { key: 'price', label: 'Price (INR)' },
      { key: 'stock', label: 'Stock (pcs)' },
      { key: 'status', label: 'Status' },
      { key: 'workType', label: 'Work Type' },
    ];
    exportToCSV('ALTS_Catalog', sarees, headers);
    toast.success('Catalog exported to CSV');
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedFabric('All');
    setSelectedStatus('All');
    setSelectedOccasion('All');
    setMaxPrice(50000);
  };

  const paginatedSarees = sarees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const tableColumns = [
    {
      title: 'Saree Code & Image',
      key: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-14 rounded-lg overflow-hidden border border-gold-400/40 bg-cream-100 flex-shrink-0 shadow-xs">
            <img
              src={row.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80'}
              alt={val}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-bold text-maroon-950 hover:text-maroon-700 transition-colors line-clamp-1">{val}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs font-semibold text-gold-800 bg-gold-50 px-1.5 py-0.2 rounded border border-gold-200">
                {row.sku}
              </span>
              <span className="text-[11px] text-slate-500">{row.color}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category & Fabric',
      key: 'category',
      render: (val, row) => (
        <div>
          <Badge size="sm">{val}</Badge>
          <p className="text-xs text-slate-500 mt-1">{row.fabric}</p>
        </div>
      ),
    },
    {
      title: 'Work / Weave',
      key: 'workType',
      render: (val) => <span className="text-xs font-medium text-slate-700">{val}</span>,
    },
    {
      title: 'Showroom Price',
      key: 'price',
      render: (val) => (
        <span className="font-bold text-maroon-950 font-brand">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Stock',
      key: 'stock',
      align: 'center',
      render: (val, row) => (
        <div className="text-center">
          <span className="font-bold text-slate-900 text-sm">{val} pcs</span>
          {val <= (row.lowStockThreshold || 4) && val > 0 && (
            <p className="text-[10px] text-amber-700 font-semibold">Low alert</p>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <Badge dot>{val}</Badge>,
    },
    {
      title: 'Actions',
      key: 'id',
      align: 'right',
      render: (id, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            title="View Details"
            onClick={() => setViewingSaree(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-maroon-800 hover:bg-cream-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            title="Edit Saree"
            onClick={() => {
              setEditingSaree(row);
              setIsFormModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-gold-700 hover:bg-gold-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              title="Delete Saree"
              onClick={(e) => handleDeleteSaree(id, row.name, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-brand text-xl font-bold text-maroon-950">Saree Products Catalog</h1>
            <p className="text-xs text-slate-500">
              Manage Kanjivaram, Banarasi, Pattu, Cotton, and Designer Silk Sarees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex items-center bg-cream-100 p-1 rounded-xl border border-cream-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-maroon-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-maroon-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Detailed Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
            disabled={sarees.length === 0}
          >
            Export
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingSaree(null);
              setIsFormModalOpen(true);
            }}
          >
            Add New Saree
          </Button>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-cream-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-2">
            <Input
              icon={Search}
              placeholder="Search by saree name, SKU (e.g. KAN-101), fabric, color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <Select
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'Kanjivaram', label: 'Kanjivaram Silk' },
              { value: 'Banarasi', label: 'Banarasi Brocade' },
              { value: 'Pattu', label: 'Pure Silk / Pattu' },
              { value: 'Cotton', label: 'Handloom Cotton' },
              { value: 'Chanderi', label: 'Chanderi' },
              { value: 'Organza', label: 'Organza' },
              { value: 'Tussar', label: 'Tussar & Kantha' },
              { value: 'Georgette', label: 'Pure Georgette' },
            ]}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />

          {/* Stock Status Filter */}
          <Select
            options={[
              { value: 'All', label: 'All Stock Status' },
              { value: 'In Stock', label: 'In Stock Only' },
              { value: 'Low Stock', label: 'Low Stock Alert' },
              { value: 'Out of Stock', label: 'Out of Stock' },
            ]}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          />

          {/* Occasion Filter */}
          <Select
            options={[
              { value: 'All', label: 'All Occasions' },
              { value: 'Bridal', label: 'Bridal / Wedding' },
              { value: 'Festive', label: 'Festive Wear' },
              { value: 'Traditional', label: 'Traditional' },
              { value: 'Party Wear', label: 'Party Wear' },
              { value: 'Casual', label: 'Casual / Daily' },
            ]}
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
          />
        </div>

        {/* Sub-bar with Price Slider & Reset */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-cream-100 text-xs">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <span className="font-semibold text-slate-600">Max Price:</span>
            <input
              type="range"
              min="3000"
              max="50000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-maroon-700 w-36 cursor-pointer"
            />
            <span className="font-bold font-brand text-maroon-950">{formatCurrency(maxPrice)}</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-slate-500">
              Found <strong className="text-maroon-950">{sarees.length}</strong> sarees
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-maroon-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* View: Product Cards Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-cream-200 bg-white p-4 space-y-3 animate-pulse">
                  <div className="h-56 bg-cream-200 rounded-xl" />
                  <div className="h-4 bg-cream-200 w-3/4 rounded" />
                  <div className="h-4 bg-cream-200 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : sarees.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedSarees.map((saree) => (
                <div
                  key={saree.id}
                  onClick={() => setViewingSaree(saree)}
                  className="group bg-white rounded-2xl border border-cream-200/90 shadow-sm hover:shadow-silk-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1 hover:border-gold-400/60"
                >
                  {/* Saree Image Container */}
                  <div className="relative aspect-[4/5] bg-cream-100 overflow-hidden">
                    <img
                      src={saree.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
                      alt={saree.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      <Badge size="sm" dot>{saree.status}</Badge>
                      <span className="px-2 py-0.5 rounded-full bg-maroon-950/80 text-gold-300 font-mono text-[10px] font-bold backdrop-blur-xs">
                        {saree.sku}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 text-maroon-950 font-bold text-xs shadow-md backdrop-blur-xs">
                        {saree.stock} in stock
                      </span>
                    </div>
                  </div>

                  {/* Saree Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-gold-800 uppercase tracking-wider">{saree.category}</span>
                        <span>{saree.fabric}</span>
                      </div>
                      <h3 className="font-bold text-sm text-maroon-950 line-clamp-2 group-hover:text-maroon-700 transition-colors">
                        {saree.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        Color: {saree.color} • {saree.workType}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-cream-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Price</span>
                        <p className="font-bold font-brand text-lg text-maroon-950">
                          {formatCurrency(saree.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingSaree(saree);
                            setIsFormModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-cream-100 text-slate-700 hover:bg-gold-50 hover:text-gold-800 transition-colors"
                          title="Edit Saree"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-cream-200">
              <Layers className="w-12 h-12 text-gold-500 mx-auto mb-3 opacity-60" />
              <h3 className="font-brand font-bold text-lg text-maroon-950">No Sarees Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No products match the selected filters. Adjust your criteria or add a new saree.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </Button>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={sarees.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
          <Table
            columns={tableColumns}
            data={paginatedSarees}
            isLoading={isLoading}
            onRowClick={(saree) => setViewingSaree(saree)}
            emptyTitle="No sarees match your criteria"
          />
          <Pagination
            currentPage={currentPage}
            totalItems={sarees.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Saree Add/Edit Form Modal */}
      <SareeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSaree(null);
        }}
        onSubmit={handleSaveSaree}
        initialData={editingSaree}
        isLoading={isSubmitting}
      />

      {/* Saree Quick View / Detail Modal */}
      <SareeDetailModal
        isOpen={!!viewingSaree}
        onClose={() => setViewingSaree(null)}
        saree={viewingSaree}
        onEdit={(saree) => {
          setEditingSaree(saree);
          setIsFormModalOpen(true);
        }}
        onNewSale={(saree) => navigate(`/sales?sareeId=${saree.id}`)}
      />
    </div>
  );
};
