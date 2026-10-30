import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  Printer,
  TrendingUp,
  Boxes,
  IndianRupee,
  Layers,
  Sparkles,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { reportService } from '../../services/reportService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('sales'); // 'sales' | 'inventory'
  const [dateRange, setDateRange] = useState('30d');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [fabricFilter, setFabricFilter] = useState('All');

  const [reportData, setReportData] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    loadReports();
  }, [dateRange, categoryFilter, fabricFilter]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const [reports, categories, trends] = await Promise.all([
        reportService.getDetailedReports({
          dateRange,
          category: categoryFilter,
          fabric: fabricFilter,
        }),
        reportService.getCategoryPerformance(),
        reportService.getSalesTrends(dateRange === '7d' ? 7 : 30),
      ]);

      setReportData(reports);
      setCategoryBreakdown(categories);
      setSalesTrend(trends);
      setCurrentPage(1);
    } catch (err) {
      toast.error('Failed to generate reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (reportType === 'sales') {
      const headers = [
        { key: 'orderNumber', label: 'Order ID' },
        { key: 'date', label: 'Date' },
        { key: 'customerName', label: 'Customer' },
        { key: 'sareeName', label: 'Saree Item' },
        { key: 'sku', label: 'SKU' },
        { key: 'category', label: 'Category' },
        { key: 'fabric', label: 'Fabric' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'unitPrice', label: 'Unit Price' },
        { key: 'lineTotal', label: 'Line Total (INR)' },
      ];
      exportToCSV('ALTS_Sales_Report', reportData?.salesRows || [], headers);
    } else {
      const headers = [
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Saree Name' },
        { key: 'category', label: 'Category' },
        { key: 'fabric', label: 'Fabric' },
        { key: 'stock', label: 'Stock (pcs)' },
        { key: 'costPrice', label: 'Cost Price' },
        { key: 'sellingPrice', label: 'Retail Price' },
        { key: 'totalCostValue', label: 'Holding Valuation' },
        { key: 'totalRetailValue', label: 'Potential Revenue' },
        { key: 'potentialProfit', label: 'Expected Margin' },
      ];
      exportToCSV('ALTS_Inventory_Valuation', reportData?.inventoryValuation || [], headers);
    }
    toast.success('Report successfully exported to CSV');
  };

  const salesColumns = [
    {
      title: 'Order ID',
      key: 'orderNumber',
      render: (val) => <span className="font-mono font-bold text-maroon-900">{val}</span>,
    },
    {
      title: 'Date',
      key: 'date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val)}</span>,
    },
    {
      title: 'Customer',
      key: 'customerName',
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>,
    },
    {
      title: 'Saree Sold',
      key: 'sareeName',
      render: (val, row) => (
        <div>
          <p className="font-bold text-maroon-950 line-clamp-1">{val}</p>
          <span className="font-mono text-[10px] text-gold-700 font-bold">{row.sku} • {row.category}</span>
        </div>
      ),
    },
    {
      title: 'Qty',
      key: 'quantity',
      align: 'center',
      render: (val) => <span className="font-bold text-slate-900">{val} pcs</span>,
    },
    {
      title: 'Unit Price',
      key: 'unitPrice',
      render: (val) => <span className="font-medium text-slate-700">{formatCurrency(val)}</span>,
    },
    {
      title: 'Line Revenue',
      key: 'lineTotal',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-maroon-950 font-brand">
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  const inventoryColumns = [
    {
      title: 'SKU & Saree Name',
      key: 'name',
      render: (val, row) => (
        <div>
          <p className="font-bold text-maroon-950">{val}</p>
          <span className="font-mono text-xs font-semibold text-gold-800">{row.sku} • {row.category}</span>
        </div>
      ),
    },
    {
      title: 'Stock (pcs)',
      key: 'stock',
      align: 'center',
      render: (val) => <span className="font-bold text-slate-900 text-sm">{val} pcs</span>,
    },
    {
      title: 'Cost / Piece',
      key: 'costPrice',
      render: (val) => <span className="font-medium text-slate-600">{formatCurrency(val)}</span>,
    },
    {
      title: 'Retail / Piece',
      key: 'sellingPrice',
      render: (val) => <span className="font-semibold text-maroon-950">{formatCurrency(val)}</span>,
    },
    {
      title: 'Holding Value (Cost)',
      key: 'totalCostValue',
      render: (val) => <span className="font-bold text-slate-800 font-brand">{formatCurrency(val)}</span>,
    },
    {
      title: 'Potential Revenue',
      key: 'totalRetailValue',
      render: (val) => <span className="font-bold text-gold-900 font-brand">{formatCurrency(val)}</span>,
    },
    {
      title: 'Expected Margin',
      key: 'potentialProfit',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-emerald-700 font-brand">
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  const currentRows = reportType === 'sales'
    ? (reportData?.salesRows || [])
    : (reportData?.inventoryValuation || []);

  const paginatedRows = currentRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-maroon-50 border border-maroon-200 text-maroon-800">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-brand text-xl font-bold text-maroon-950">Financial & Saree Reports</h1>
            <p className="text-xs text-slate-500">
              Audit sales performance, inventory valuation holding, and profit margins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="gold"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4.5 rounded-2xl border border-cream-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Report Mode Switcher */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Report Subject
            </label>
            <Select
              options={[
                { value: 'sales', label: 'Itemized Sales Performance' },
                { value: 'inventory', label: 'Inventory Valuation & Margin' },
              ]}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Date Period
            </label>
            <Select
              options={[
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'This Quarter (90 Days)' },
                { value: 'year', label: 'Full Financial Year' },
              ]}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Weave Category
            </label>
            <Select
              options={[
                { value: 'All', label: 'All Categories' },
                { value: 'Kanjivaram', label: 'Kanjivaram' },
                { value: 'Banarasi', label: 'Banarasi' },
                { value: 'Pattu', label: 'Pure Silk / Pattu' },
                { value: 'Cotton', label: 'Cotton' },
                { value: 'Organza', label: 'Organza' },
                { value: 'Chanderi', label: 'Chanderi' },
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>

          {/* Fabric Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Fabric Type
            </label>
            <Select
              options={[
                { value: 'All', label: 'All Fabrics' },
                { value: 'Pure Mulberry Silk', label: 'Pure Mulberry Silk' },
                { value: 'Katan Silk', label: 'Katan Silk' },
                { value: 'Soft Silk', label: 'Soft Silk' },
                { value: 'Mulmul Cotton', label: 'Mulmul Cotton' },
                { value: 'Organza Silk', label: 'Organza Silk' },
              ]}
              value={fabricFilter}
              onChange={(e) => setFabricFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-cream-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stock Units</p>
          <h3 className="text-2xl font-bold font-brand text-maroon-950 mt-1">
            {reportData?.totalStockUnits || 0} pcs
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Physical showroom inventory</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-cream-200 shadow-sm">
          <p className="text-xs font-semibold text-gold-800 uppercase tracking-wider">Total Holding Cost Basis</p>
          <h3 className="text-2xl font-bold font-brand text-maroon-950 mt-1">
            {formatCurrency(reportData?.totalHoldingCost || 0)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Capital invested in stock</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-cream-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Potential Retail Realization</p>
          <h3 className="text-2xl font-bold font-brand text-emerald-800 mt-1">
            {formatCurrency(reportData?.totalRetailPotential || 0)}
          </h3>
          <p className="text-[11px] text-emerald-700 mt-0.5">Estimated gross sales value</p>
        </div>
      </div>

      {/* Analytical Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Revenue Performance Bar Chart */}
        <div className="lg:col-span-7">
          <Card
            title="Category Revenue Distribution"
            subtitle="Total sales generated per saree weave family"
          >
            <div className="h-72 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DFD3" />
                  <XAxis dataKey="name" stroke="#937862" fontSize={10} angle={-25} textAnchor="end" />
                  <YAxis
                    stroke="#937862"
                    fontSize={10}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#2C030B',
                      borderColor: '#D4AF37',
                      borderRadius: '10px',
                      color: '#FAF4E2',
                    }}
                  />
                  <Bar dataKey="value" fill="#800020" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Sales Timeline Line Chart */}
        <div className="lg:col-span-5">
          <Card
            title="Revenue Timeline Velocity"
            subtitle="Daily performance trajectory"
          >
            <div className="h-72 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DFD3" />
                  <XAxis dataKey="displayDate" stroke="#937862" fontSize={10} />
                  <YAxis
                    stroke="#937862"
                    fontSize={10}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Daily Revenue']}
                    contentStyle={{
                      backgroundColor: '#2C030B',
                      borderColor: '#D4AF37',
                      borderRadius: '10px',
                      color: '#FAF4E2',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    dot={{ fill: '#800020', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Itemized Detail Table */}
      <Card
        title={reportType === 'sales' ? 'Itemized Sales Journal' : 'Stock Valuation & Margins Ledger'}
        subtitle={`Showing ${currentRows.length} total transaction entries`}
      >
        <Table
          columns={reportType === 'sales' ? salesColumns : inventoryColumns}
          data={paginatedRows}
          isLoading={isLoading}
          emptyTitle="No data available for selected filters"
        />
        <Pagination
          currentPage={currentPage}
          totalItems={currentRows.length}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </Card>
    </div>
  );
};
