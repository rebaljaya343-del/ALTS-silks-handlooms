import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Boxes,
  AlertTriangle,
  IndianRupee,
  Clock,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Layers,
  FileText,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Table } from '../../components/Table';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { reportService } from '../../services/reportService';
import { orderService } from '../../services/orderService';
import { InvoiceModal } from '../sales/InvoiceModal';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trendDays, setTrendDays] = useState(7);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [fabricData, setFabricData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [trendDays]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashStats, trends, categories, fabrics, orders] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getSalesTrends(trendDays),
        reportService.getCategoryPerformance(),
        reportService.getFabricPerformance(),
        orderService.getOrders(),
      ]);

      setStats(dashStats);
      setTrendData(trends);
      setCategoryData(categories);
      setFabricData(fabrics);
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error('Failed loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const recentOrdersColumns = [
    {
      title: 'Order ID',
      key: 'orderNumber',
      render: (val) => <span className="font-mono font-bold text-maroon-900">{val}</span>,
    },
    {
      title: 'Customer',
      key: 'customerName',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900">{val}</p>
          <p className="text-[11px] text-slate-400 font-mono">{row.customerPhone}</p>
        </div>
      ),
    },
    {
      title: 'Sarees',
      key: 'items',
      render: (items) => (
        <span className="font-medium text-slate-700">
          {items?.reduce((sum, i) => sum + i.quantity, 0)} pcs ({items?.length} types)
        </span>
      ),
    },
    {
      title: 'Total (₹)',
      key: 'totalAmount',
      render: (val) => <span className="font-bold text-maroon-950">{formatCurrency(val)}</span>,
    },
    {
      title: 'Payment',
      key: 'paymentMethod',
      render: (val) => <span className="text-xs font-medium px-2 py-0.5 rounded bg-cream-200 text-slate-700">{val}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <Badge dot>{val}</Badge>,
    },
    {
      title: 'Action',
      key: 'id',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedInvoiceOrder(row);
          }}
        >
          Bill
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-maroon-950 via-maroon-900 to-[#3a0815] p-6 sm:p-8 text-white border border-gold-500/30 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <span className="text-9xl">🥻</span>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-400/30 text-gold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Live Showroom Analytics</span>
            </div>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-gold-100">
              Welcome to ALTS Silks Portal
            </h1>
            <p className="text-xs sm:text-sm text-cream-200/80">
              Real-time monitoring of bridal saree stock, showroom orders, weavers consignments, and customer revenue.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="gold"
              icon={ShoppingBag}
              onClick={() => navigate('/sales?action=new')}
            >
              Start New Sale
            </Button>
            <Button
              variant="outline"
              className="text-gold-200 border-gold-400/40 hover:bg-white/10"
              icon={Layers}
              onClick={() => navigate('/sarees?action=new')}
            >
              Add Saree
            </Button>
          </div>
        </div>
      </div>

      {/* 5 Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Customers"
          value={stats ? stats.totalCustomers : '—'}
          subtitle="Registered bridal & retail buyers"
          icon={Users}
          trend="+18.4%"
          trendDirection="up"
          variant="maroon"
          onClick={() => navigate('/customers')}
        />

        <StatCard
          title="Sarees In Stock"
          value={stats ? `${stats.totalSareesInStock} pcs` : '—'}
          subtitle={`Across ${stats?.totalCatalogProducts || 10} saree types`}
          icon={Boxes}
          trend="Healthy"
          trendDirection="up"
          variant="emerald"
          onClick={() => navigate('/inventory')}
        />

        <StatCard
          title="Low-Stock Alerts"
          value={stats ? stats.lowStockAlerts : '—'}
          subtitle="Needs weaver replenishment"
          icon={AlertTriangle}
          trend={stats?.lowStockAlerts > 0 ? 'Requires attention' : 'All good'}
          trendDirection={stats?.lowStockAlerts > 0 ? 'down' : 'up'}
          variant="amber"
          onClick={() => navigate('/inventory')}
        />

        <StatCard
          title="Today's Sales"
          value={stats ? formatCurrency(stats.todaysSales) : '—'}
          subtitle="Cash & digital showroom billing"
          icon={IndianRupee}
          trend="+24.2%"
          trendDirection="up"
          variant="gold"
          onClick={() => navigate('/sales')}
        />

        <StatCard
          title="Pending Orders"
          value={stats ? stats.pendingOrdersCount : '—'}
          subtitle="Awaiting payment or packing"
          icon={Clock}
          trend="Live queue"
          trendDirection="neutral"
          variant="slate"
          onClick={() => navigate('/sales')}
        />
      </div>

      {/* Charts Row: Sales Revenue Trend (7/30 Days) + Best-Selling Saree Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend (7 Cols) */}
        <div className="lg:col-span-7">
          <Card
            title="Sales Revenue & Order Trend"
            subtitle="Daily billing volume and customer order count"
            action={
              <div className="flex items-center gap-1 bg-cream-200/80 p-1 rounded-lg">
                <button
                  onClick={() => setTrendDays(7)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    trendDays === 7
                      ? 'bg-maroon-800 text-gold-200 shadow-sm'
                      : 'text-slate-600 hover:text-maroon-900'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setTrendDays(30)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    trendDays === 30
                      ? 'bg-maroon-800 text-gold-200 shadow-sm'
                      : 'text-slate-600 hover:text-maroon-900'
                  }`}
                >
                  Last 30 Days
                </button>
              </div>
            }
          >
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#800020" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#800020" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DFD3" />
                  <XAxis dataKey="displayDate" stroke="#937862" fontSize={11} />
                  <YAxis
                    stroke="#937862"
                    fontSize={11}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      name === 'revenue' ? formatCurrency(val) : val,
                      name === 'revenue' ? 'Revenue' : 'Orders Count',
                    ]}
                    contentStyle={{
                      backgroundColor: '#2C030B',
                      borderColor: '#D4AF37',
                      borderRadius: '10px',
                      color: '#FAF4E2',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#800020"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                    name="revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Best-Selling Categories Donut Chart (5 Cols) */}
        <div className="lg:col-span-5">
          <Card
            title="Best-Selling Saree Categories"
            subtitle="Revenue contribution by weave style"
            action={
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-maroon-800"
                onClick={() => navigate('/sarees')}
              >
                Catalog <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#800020'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#2C030B',
                      borderColor: '#D4AF37',
                      borderRadius: '10px',
                      color: '#FAF4E2',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown pills */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cream-200 text-xs">
              {categoryData.slice(0, 4).map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 truncate">{cat.name}:</span>
                  <span className="font-semibold text-maroon-950 ml-auto">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Fabric Revenue Breakdown + Recent Showroom Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fabric Breakdown Bar Chart (4 Cols) */}
        <div className="lg:col-span-4">
          <Card
            title="Fabric Demand Share"
            subtitle="Mulberry Silk vs Handloom Cotton vs Organza"
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fabricData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8DFD3" />
                  <XAxis type="number" stroke="#937862" fontSize={10} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="fabric" type="category" stroke="#937862" fontSize={11} width={95} />
                  <Tooltip
                    formatter={(val) => [`${val}% Share`, 'Demand']}
                    contentStyle={{
                      backgroundColor: '#2C030B',
                      borderColor: '#D4AF37',
                      borderRadius: '10px',
                      color: '#FAF4E2',
                    }}
                  />
                  <Bar dataKey="share" fill="#D4AF37" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Orders Table (8 Cols) */}
        <div className="lg:col-span-8">
          <Card
            title="Recent Sales & Invoices"
            subtitle="Latest billing counter transactions"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/sales')}
                className="text-xs"
              >
                View All Orders
              </Button>
            }
          >
            <Table
              columns={recentOrdersColumns}
              data={recentOrders}
              isLoading={isLoading}
              emptyTitle="No recent orders"
            />
          </Card>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
        />
      )}
    </div>
  );
};
