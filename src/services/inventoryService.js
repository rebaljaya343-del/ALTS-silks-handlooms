import api from './api';
import { INITIAL_INVENTORY_LOGS } from './mockData';
import { sareeService } from './sareeService';

const LOGS_KEY = 'saree_inventory_logs_data';

const getStoredLogs = () => {
  const data = localStorage.getItem(LOGS_KEY);
  if (!data) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_INVENTORY_LOGS));
    return INITIAL_INVENTORY_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_INVENTORY_LOGS;
  }
};

const saveLogs = (logs) => {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const inventoryService = {
  // Get all inventory stock statuses
  getInventoryStock: async (search = '') => {
    // TODO: replace with API call: return (await api.get('/inventory/stock', { params: { search } })).data;
    const sarees = await sareeService.getSarees({ search });
    return sarees.map((s) => ({
      id: s.id,
      name: s.name,
      sku: s.sku,
      category: s.category,
      fabric: s.fabric,
      price: s.price,
      costPrice: s.costPrice,
      stock: s.stock,
      lowStockThreshold: s.lowStockThreshold || 5,
      status: s.status,
      image: s.images && s.images[0],
    }));
  },

  // Adjust stock level (Stock-In or Stock-Out)
  adjustStock: async ({ sareeId, type, quantity, reason, notes, adjustedBy = 'Store Admin' }) => {
    // TODO: replace with API call: return (await api.post('/inventory/adjust', payload)).data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) throw new Error('Invalid quantity');

    const saree = await sareeService.getSareeById(sareeId);
    let newStock = saree.stock;

    if (type === 'IN') {
      newStock += qty;
    } else if (type === 'OUT') {
      if (saree.stock < qty) {
        throw new Error(`Insufficient stock. Current stock is ${saree.stock}`);
      }
      newStock -= qty;
    }

    // Update saree stock
    await sareeService.updateSaree(sareeId, { stock: newStock });

    // Create log record
    const logs = getStoredLogs();
    const newLog = {
      id: `inv-${Date.now()}`,
      sareeId,
      sareeName: saree.name,
      sku: saree.sku,
      type,
      quantity: qty,
      reason,
      adjustedBy,
      timestamp: new Date().toISOString(),
      notes: notes || '',
    };

    saveLogs([newLog, ...logs]);
    return { success: true, updatedStock: newStock, log: newLog };
  },

  // Get stock movement history logs
  getStockLogs: async (filters = {}) => {
    // TODO: replace with API call: return (await api.get('/inventory/logs', { params: filters })).data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    let logs = getStoredLogs();

    if (filters.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.sareeName.toLowerCase().includes(q) ||
          l.sku.toLowerCase().includes(q) ||
          l.reason.toLowerCase().includes(q) ||
          (l.notes && l.notes.toLowerCase().includes(q))
      );
    }

    if (filters.type && filters.type !== 'All') {
      logs = logs.filter((l) => l.type === filters.type);
    }

    if (filters.reason && filters.reason !== 'All') {
      logs = logs.filter((l) => l.reason.toLowerCase() === filters.reason.toLowerCase());
    }

    return logs;
  },
};
