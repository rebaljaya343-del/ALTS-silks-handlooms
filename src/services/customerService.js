import api from './api';
import { INITIAL_CUSTOMERS, INITIAL_ORDERS } from './mockData';

const CUSTOMERS_KEY = 'saree_customers_data';
const ORDERS_KEY = 'saree_orders_data';

const getStoredCustomers = () => {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  if (!data) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CUSTOMERS;
  }
};

const saveCustomers = (customers) => {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const customerService = {
  getCustomers: async (search = '') => {
    // TODO: replace with API call: return (await api.get('/customers', { params: { search } })).data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    let list = getStoredCustomers();

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getCustomerById: async (id) => {
    // TODO: replace with API call: return (await api.get(`/customers/${id}`)).data;
    await new Promise((resolve) => setTimeout(resolve, 250));
    const customers = getStoredCustomers();
    const customer = customers.find((c) => c.id === id);
    if (!customer) throw new Error('Customer not found');

    // Fetch this customer's orders
    const ordersData = localStorage.getItem(ORDERS_KEY);
    const allOrders = ordersData ? JSON.parse(ordersData) : INITIAL_ORDERS;
    const customerOrders = allOrders.filter((o) => o.customerId === id || o.customerPhone === customer.phone);

    return {
      ...customer,
      orders: customerOrders,
    };
  },

  createCustomer: async (customerData) => {
    // TODO: replace with API call: return (await api.post('/customers', customerData)).data;
    await new Promise((resolve) => setTimeout(resolve, 350));
    const list = getStoredCustomers();
    const newCustomer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalOrders: 0,
      totalSpend: 0,
      tier: customerData.tier || 'Regular',
      createdAt: new Date().toISOString(),
    };
    const updated = [newCustomer, ...list];
    saveCustomers(updated);
    return newCustomer;
  },

  updateCustomer: async (id, updateData) => {
    // TODO: replace with API call: return (await api.put(`/customers/${id}`, updateData)).data;
    await new Promise((resolve) => setTimeout(resolve, 350));
    const list = getStoredCustomers();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found');

    list[index] = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    saveCustomers(list);
    return list[index];
  },

  deleteCustomer: async (id) => {
    // TODO: replace with API call: return (await api.delete(`/customers/${id}`)).data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    let list = getStoredCustomers();
    list = list.filter((c) => c.id !== id);
    saveCustomers(list);
    return { success: true, id };
  },
};
