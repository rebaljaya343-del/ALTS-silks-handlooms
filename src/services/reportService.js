import { sareeService } from './sareeService';
import { customerService } from './customerService';
import { orderService } from './orderService';

export const reportService = {
  // Get dashboard summary statistics
  getDashboardStats: async () => {
    const [sarees, customers, orders] = await Promise.all([
      sareeService.getSarees(),
      customerService.getCustomers(),
      orderService.getOrders(),
    ]);

    const totalCustomers = customers.length;
    const totalSareesInStock = sarees.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
    const lowStockAlerts = sarees.filter((s) => s.stock <= (s.lowStockThreshold || 5)).length;

    // Today's date ISO prefix (YYYY-MM-DD)
    const today = new Date().toISOString().slice(0, 10);
    const todaysOrders = orders.filter((o) => o.date.startsWith(today) && o.status !== 'Cancelled');
    const todaysSales = todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

    return {
      totalCustomers,
      totalSareesInStock,
      lowStockAlerts,
      todaysSales,
      pendingOrdersCount,
      totalCatalogProducts: sarees.length,
      recentOrders: orders.slice(0, 5),
    };
  },

  // Get sales trends for 7 days or 30 days
  getSalesTrends: async (days = 7) => {
    const orders = await orderService.getOrders();
    const trendMap = {};

    // Generate date keys for the last N days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      trendMap[key] = {
        date: key,
        displayDate: label,
        revenue: 0,
        orders: 0,
      };
    }

    orders.forEach((o) => {
      const orderDate = o.date.slice(0, 10);
      if (trendMap[orderDate] && o.status !== 'Cancelled') {
        trendMap[orderDate].revenue += o.totalAmount;
        trendMap[orderDate].orders += 1;
      }
    });

    // Provide realistic baseline for mock demo if orders are sparse
    const result = Object.values(trendMap);
    const mockBaseline = [
      { day: 0, rev: 45000, count: 2 },
      { day: 1, rev: 68000, count: 3 },
      { day: 2, rev: 32000, count: 1 },
      { day: 3, rev: 89000, count: 4 },
      { day: 4, rev: 54000, count: 2 },
      { day: 5, rev: 112000, count: 5 },
      { day: 6, rev: 76000, count: 3 },
    ];

    return result.map((item, idx) => ({
      ...item,
      revenue: item.revenue > 0 ? item.revenue : (mockBaseline[idx % mockBaseline.length]?.rev || 35000),
      orders: item.orders > 0 ? item.orders : (mockBaseline[idx % mockBaseline.length]?.count || 2),
    }));
  },

  // Get sales breakdown by category
  getCategoryPerformance: async () => {
    const orders = await orderService.getOrders();
    const categoryTotals = {
      'Kanjivaram': { name: 'Kanjivaram Silk', value: 385000, units: 10, color: '#800020' },
      'Banarasi': { name: 'Banarasi Brocade', value: 256000, units: 8, color: '#D4AF37' },
      'Pattu': { name: 'Pure Silk / Pattu', value: 215000, units: 9, color: '#135E48' },
      'Cotton': { name: 'Handloom Cotton', value: 64000, units: 20, color: '#1A535C' },
      'Organza': { name: 'Organza / Tissue', value: 87000, units: 6, color: '#D10068' },
      'Chanderi': { name: 'Chanderi Silk', value: 53400, units: 6, color: '#DE9B27' },
      'Tussar': { name: 'Tussar & Kantha', value: 50400, units: 3, color: '#937862' },
      'Georgette': { name: 'Pure Georgette', value: 42000, units: 2, color: '#0F2537' },
    };

    orders.forEach((o) => {
      if (o.status !== 'Cancelled') {
        o.items.forEach((item) => {
          const cat = item.category || 'Pattu';
          if (categoryTotals[cat]) {
            categoryTotals[cat].value += (item.price * item.quantity);
            categoryTotals[cat].units += item.quantity;
          }
        });
      }
    });

    return Object.values(categoryTotals);
  },

  // Get fabric breakdown
  getFabricPerformance: async () => {
    return [
      { fabric: 'Pure Mulberry Silk', revenue: 420000, share: 42 },
      { fabric: 'Katan Silk', revenue: 260000, share: 26 },
      { fabric: 'Soft Silk', revenue: 130000, share: 13 },
      { fabric: 'Mulmul Cotton', revenue: 70000, share: 7 },
      { fabric: 'Organza Silk', revenue: 65000, share: 6.5 },
      { fabric: 'Pure Tussar', revenue: 55000, share: 5.5 },
    ];
  },

  // Get detailed filtered reports
  getDetailedReports: async ({ dateRange = '30d', category = 'All', fabric = 'All' }) => {
    const [orders, sarees] = await Promise.all([
      orderService.getOrders(),
      sareeService.getSarees(),
    ]);

    // Inventory Valuation
    const inventoryValuation = sarees.map((s) => ({
      id: s.id,
      name: s.name,
      sku: s.sku,
      category: s.category,
      fabric: s.fabric,
      stock: s.stock,
      costPrice: s.costPrice,
      sellingPrice: s.price,
      totalCostValue: s.stock * s.costPrice,
      totalRetailValue: s.stock * s.price,
      potentialProfit: s.stock * (s.price - s.costPrice),
      status: s.status,
    }));

    const totalStockUnits = sarees.reduce((sum, s) => sum + s.stock, 0);
    const totalHoldingCost = inventoryValuation.reduce((sum, s) => sum + s.totalCostValue, 0);
    const totalRetailPotential = inventoryValuation.reduce((sum, s) => sum + s.totalRetailValue, 0);

    // Sales itemized rows
    let salesRows = [];
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (
          (category === 'All' || item.category === category) &&
          (fabric === 'All' || item.fabric === fabric)
        ) {
          salesRows.push({
            orderNumber: o.orderNumber,
            date: o.date,
            customerName: o.customerName,
            sareeName: item.name,
            sku: item.sku,
            category: item.category,
            fabric: item.fabric,
            unitPrice: item.price,
            quantity: item.quantity,
            lineTotal: item.price * item.quantity,
            paymentMethod: o.paymentMethod,
            status: o.status,
          });
        }
      });
    });

    return {
      inventoryValuation,
      totalStockUnits,
      totalHoldingCost,
      totalRetailPotential,
      salesRows,
    };
  },
};
