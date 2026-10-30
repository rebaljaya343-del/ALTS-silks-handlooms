import api from './api';

export const orderService = {
  getMyOrders: async () => {
    const { data } = await api.get('/customer-auth/orders');
    return data;
  },

  createCustomerOrder: async (orderPayload) => {
    const { data } = await api.post('/shop/orders', orderPayload);
    return data;
  },

  getOrders: async (filters = {}) => {
    const { data } = await api.get('/orders', { params: filters });
    return data;
  },

  getOrderById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  createOrder: async (orderPayload) => {
    const { data } = await api.post('/orders', orderPayload);
    return data;
  },

  updateOrderStatus: async (id, statusOrPayload, maybeRejectionReason) => {
    let body;
    if (typeof statusOrPayload === 'string') {
      body = {
        status: statusOrPayload,
        ...(maybeRejectionReason ? { rejectionReason: maybeRejectionReason } : {}),
      };
    } else {
      body = statusOrPayload;
    }
    const { data } = await api.patch(`/orders/${id}/status`, body);
    return data;
  },

  getNewOrderSummary: async () => {
    const { data } = await api.get('/orders/summary/new-count');
    return data;
  },
};
