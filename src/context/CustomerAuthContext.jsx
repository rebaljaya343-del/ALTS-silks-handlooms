import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const CustomerAuthContext = createContext(null);
const STORAGE_KEY = 'saree_customer_auth';

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.token && parsed?.customer) {
        setCustomer(parsed.customer);
        setToken(parsed.token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistSession = (nextCustomer, nextToken) => {
    setCustomer(nextCustomer);
    setToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customer: nextCustomer, token: nextToken }));
  };

  const register = async (payload) => {
    const { data } = await api.post('/customer-auth/register', payload);
    persistSession(data.customer, data.token);
    return data;
  };

  const login = async (payload) => {
    const { data } = await api.post('/customer-auth/login', payload);
    persistSession(data.customer, data.token);
    return data;
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      customer,
      token,
      isAuthenticated: !!customer && !!token,
      loading,
      register,
      login,
      logout,
    }),
    [customer, token, loading]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
