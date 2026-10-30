import api from './api';
import { INITIAL_SAREES } from './mockData';

const STORAGE_KEY = 'saree_products_data';

// Helper to get local data or fallback to initial dataset
const getStoredSarees = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAREES));
    return INITIAL_SAREES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SAREES;
  }
};

const saveSarees = (sarees) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sarees));
};

export const sareeService = {
  // Get all sarees with optional query filters
  getSarees: async (filters = {}) => {
    // TODO: replace with API call: return (await api.get('/sarees', { params: filters })).data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    let list = getStoredSarees();

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.sku.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.fabric.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'All') {
      list = list.filter((s) => s.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.fabric && filters.fabric !== 'All') {
      list = list.filter((s) => s.fabric.toLowerCase() === filters.fabric.toLowerCase());
    }

    if (filters.occasion && filters.occasion !== 'All') {
      list = list.filter((s) => s.occasion.toLowerCase() === filters.occasion.toLowerCase());
    }

    if (filters.status && filters.status !== 'All') {
      list = list.filter((s) => s.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      list = list.filter((s) => s.price >= filters.minPrice && s.price <= filters.maxPrice);
    }

    return list;
  },

  // Get single saree by ID
  getSareeById: async (id) => {
    // TODO: replace with API call: return (await api.get(`/sarees/${id}`)).data;
    await new Promise((resolve) => setTimeout(resolve, 200));
    const list = getStoredSarees();
    const item = list.find((s) => s.id === id);
    if (!item) throw new Error('Saree not found');
    return item;
  },

  // Create new saree product
  createSaree: async (sareeData) => {
    // TODO: replace with API call: return (await api.post('/sarees', sareeData)).data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    const list = getStoredSarees();
    const stock = Number(sareeData.stock || 0);
    const threshold = Number(sareeData.lowStockThreshold || 5);
    
    let status = 'In Stock';
    if (stock === 0) status = 'Out of Stock';
    else if (stock <= threshold) status = 'Low Stock';

    const newSaree = {
      ...sareeData,
      id: `sar-${Date.now()}`,
      price: Number(sareeData.price),
      costPrice: Number(sareeData.costPrice || (sareeData.price * 0.65)),
      stock,
      lowStockThreshold: threshold,
      status,
      createdAt: new Date().toISOString(),
      images: sareeData.images && sareeData.images.length > 0 
        ? sareeData.images 
        : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
    };

    const updated = [newSaree, ...list];
    saveSarees(updated);
    return newSaree;
  },

  // Update existing saree
  updateSaree: async (id, updateData) => {
    // TODO: replace with API call: return (await api.put(`/sarees/${id}`, updateData)).data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    const list = getStoredSarees();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Saree not found');

    const stock = Number(updateData.stock !== undefined ? updateData.stock : list[index].stock);
    const threshold = Number(updateData.lowStockThreshold !== undefined ? updateData.lowStockThreshold : list[index].lowStockThreshold);

    let status = 'In Stock';
    if (stock === 0) status = 'Out of Stock';
    else if (stock <= threshold) status = 'Low Stock';

    const updatedSaree = {
      ...list[index],
      ...updateData,
      price: Number(updateData.price !== undefined ? updateData.price : list[index].price),
      costPrice: Number(updateData.costPrice !== undefined ? updateData.costPrice : list[index].costPrice),
      stock,
      lowStockThreshold: threshold,
      status,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updatedSaree;
    saveSarees(list);
    return updatedSaree;
  },

  // Delete saree
  deleteSaree: async (id) => {
    // TODO: replace with API call: return (await api.delete(`/sarees/${id}`)).data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    let list = getStoredSarees();
    list = list.filter((s) => s.id !== id);
    saveSarees(list);
    return { success: true, id };
  },
};
