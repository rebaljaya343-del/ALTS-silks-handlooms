import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  PackageX,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Pagination } from '../../components/Pagination';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { inventoryService } from '../../services/inventoryService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../hooks/useAuth';

export const InventoryPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'history'
  const [stockList, setStockList] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [stockSearch, setStockSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyType, setHistoryType] = useState('All');

  // Pagination
  const [stockPage, setStockPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 6;

  // Modal
  const [selectedSareeForAdjustment, setSelectedSareeForAdjustment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, [stockSearch, historySearch, historyType]);

  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      const [stocks, logs] = await Promise.all([
        inventoryService.getInventoryStock(stockSearch),
        inventoryService.getStockLogs({
          search: historySearch,
          type: historyType,
        }),
      ]);
      setStockList(stocks);
      setHistoryLogs(logs);
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockAdjustment = async (adjustmentData) => {
    try {
      setIsSubmitting(true);
      await inventoryService.adjustStock({
        ...adjustmentData,
        adjustedBy: `${user?.name || 'Staff'} (${user?.roleTitle || 'Executive'})`,
      });
      toast.success(
        `Stock successfully ${adjustmentData.type === 'IN' ? 'added' : 'deducted'}!`
      );
      setSelectedSareeForAdjustment(null);
      loadInventoryData();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportStock = () => {
    const headers = [
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Saree Name' },
      { key: 'category', label: 'Category' },
      { key: 'stock', label: 'Current Stock' },
      { key: 'lowStockThreshold', label: 'Alert Threshold' },
      { key: 'status', label: 'Stock Status' },
      { key: 'price', label: 'Unit Price' },
    ];
    exportToCSV('ALTS_Stock_Levels', stockList, headers);
    toast.success('Stock levels exported');
  };

  const handleExportHistory = () => {
    const headers = [
      { key: 'timestamp', label: 'Date & Time' },
      { key: 'sku', label: 'SKU' },
      { key: 'sareeName', label: 'Saree Name' },
      { key: 'type', label: 'Type (+/-)' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'reason', label: 'Reason' },
      { key: 'adjustedBy', label: 'Staff Member' },
      { key: 'notes', label: 'Remarks' },
    ];
    exportToCSV('ALTS_Movement_Logs', historyLogs, headers);
    toast.success('Movement logs exported');
  };

  // Metrics
  const totalUnits = stockList.reduce((sum, s) => sum + s.stock, 0);
  const lowStockCount = stockList.filter((s) => s.stock <= s.lowStockThreshold && s.stock > 0).length;
  const outOfStockCount = stockList.filter((s) => s.stock === 0).length;
  const totalValuation = stockList.reduce((sum, s) => sum + s.stock * (s.costPrice || s.price * 0.65), 0);

  // Pagination slices
  const paginatedStock = stockList.slice((stockPage - 1) * pageSize, stockPage * pageSize);
  const paginatedHistory = historyLogs.slice((historyPage - 1) * pageSize, historyPage * pageSize);

  // Table Columns
  const stockColumns = [
    {
      title: 'Saree Code & Details',
      key: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-13 rounded-lg overflow-hidden border border-cream-300 bg-cream-100 flex-shrink-0">
            <img src={row.image} alt={val} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-maroon-950">{val}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs font-semibold text-gold-800 bg-gold-50 px-1.5 py-0.2 rounded border border-gold-200">
                {row.sku}
              </span>
              <span className="text-[11px] text-slate-500">{row.category} • {row.fabric}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Stock on Hand',
      key: 'stock',
      align: 'center',
      render: (val, row) => (
        <div className="text-center">
          <span className="font-bold text-base text-maroon-950">{val} pcs</span>
          <p className="text-[10px] text-slate-400">Min Alert: {row.lowStockThreshold} pcs</p>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <Badge dot>{val}</Badge>,
    },
    {
      title: 'Unit Value',
      key: 'price',
      render: (val) => <span className="font-bold text-slate-800 font-brand">{formatCurrency(val)}</span>,
    },
    {
      title: 'Adjust Stock',
      key: 'id',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            icon={ArrowUpRight}
            onClick={() => setSelectedSareeForAdjustment(row)}
          >
            Adjust Stock
          </Button>
        </div>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Timestamp',
      key: 'timestamp',
      render: (val) => <span className="text-xs text-slate-600 font-medium">{formatDate(val, true)}</span>,
    },
    {
      title: 'Saree Name & SKU',
      key: 'sareeName',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900">{val}</p>
          <span className="font-mono text-[11px] text-gold-700 font-bold">{row.sku}</span>
        </div>
      ),
    },
    {
      title: 'Movement',
      key: 'type',
      render: (val, row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            val === 'IN'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {val === 'IN' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {val === 'IN' ? `+${row.quantity} IN` : `-${row.quantity} OUT`}
        </span>
      ),
    },
    {
      title: 'Audit Reason',
      key: 'reason',
      render: (val) => <span className="text-xs font-semibold text-maroon-900">{val}</span>,
    },
    {
      title: 'Staff Member',
      key: 'adjustedBy',
      render: (val) => <span className="text-xs text-slate-600">{val}</span>,
    },
    {
      title: 'Remarks / Notes',
      key: 'notes',
      render: (val) => <span className="text-xs text-slate-500 italic">{val || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-brand text-xl font-bold text-maroon-950">Inventory & Stock Controls</h1>
            <p className="text-xs text-slate-500">
              Live showroom inventory monitoring, stock-in/out adjustments, and complete audit trail
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={activeTab === 'stock' ? handleExportStock : handleExportHistory}
          >
            Export {activeTab === 'stock' ? 'Stock CSV' : 'Audit Logs'}
          </Button>
        </div>
      </div>

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-cream-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stock on Hand</p>
            <h3 className="text-2xl font-bold font-brand text-maroon-950 mt-1">{totalUnits} pcs</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Across {stockList.length} saree designs</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-cream-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Low Stock Warnings</p>
            <h3 className="text-2xl font-bold font-brand text-amber-900 mt-1">{lowStockCount} lines</h3>
            <p className="text-[11px] text-amber-700 mt-0.5">Order from weavers soon</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-cream-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Out of Stock Lines</p>
            <h3 className="text-2xl font-bold font-brand text-rose-900 mt-1">{outOfStockCount} items</h3>
            <p className="text-[11px] text-rose-600 mt-0.5">Zero showroom pieces</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <PackageX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-cream-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gold-800 uppercase tracking-wider">Holding Cost Valuation</p>
            <h3 className="text-2xl font-bold font-brand text-maroon-950 mt-1">
              {formatCurrency(totalValuation)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Acquisition cost basis</p>
          </div>
          <div className="p-3 rounded-xl bg-gold-50 text-gold-700 border border-gold-300">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-cream-300 pb-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stock'
              ? 'bg-maroon-800 text-gold-200 shadow-md border border-gold-400/40'
              : 'bg-white text-slate-600 hover:bg-cream-100 border border-cream-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Showroom Stock Levels ({stockList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-maroon-800 text-gold-200 shadow-md border border-gold-400/40'
              : 'bg-white text-slate-600 hover:bg-cream-100 border border-cream-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Movement Audit Trail ({historyLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Live Stock Levels */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-cream-200 shadow-sm">
            <div className="max-w-md">
              <Input
                icon={Search}
                placeholder="Search stock by saree name or SKU..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-cream-200 shadow-sm overflow-hidden">
            <Table
              columns={stockColumns}
              data={paginatedStock}
              isLoading={isLoading}
              emptyTitle="No stock records found"
            />
            <Pagination
              currentPage={stockPage}
              totalItems={stockList.length}
              pageSize={pageSize}
              onPageChange={(p) => setStockPage(p)}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Stock Movement Audit History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-cream-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:max-w-md">
              <Input
                icon={Search}
                placeholder="Filter logs by saree name, reason, or staff..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                options={[
                  { value: 'All', label: 'All Movements (+/-)' },
                  { value: 'IN', label: 'Stock-IN Only (+)' },
                  { value: 'OUT', label: 'Stock-OUT Only (-)' },
                ]}
                value={historyType}
                onChange={(e) => setHistoryType(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-cream-200 shadow-sm overflow-hidden">
            <Table
              columns={historyColumns}
              data={paginatedHistory}
              isLoading={isLoading}
              emptyTitle="No movement logs recorded"
            />
            <Pagination
              currentPage={historyPage}
              totalItems={historyLogs.length}
              pageSize={pageSize}
              onPageChange={(p) => setHistoryPage(p)}
            />
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedSareeForAdjustment && (
        <StockAdjustmentModal
          isOpen={!!selectedSareeForAdjustment}
          onClose={() => setSelectedSareeForAdjustment(null)}
          saree={selectedSareeForAdjustment}
          onSubmit={handleStockAdjustment}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};
