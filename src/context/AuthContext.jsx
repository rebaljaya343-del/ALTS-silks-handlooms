import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const STORAGE_AUTH_KEY = 'saree_auth_user';

export const DEMO_USERS = {
  admin: {
    email: 'admin@alts.com',
  },
  staff: {
    email: 'staff@alts.com',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_AUTH_KEY) || sessionStorage.getItem(STORAGE_AUTH_KEY);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem(STORAGE_AUTH_KEY);
        sessionStorage.removeItem(STORAGE_AUTH_KEY);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername, password, rememberMe = true) => {
    const response = await api.post('/auth/login', {
      email: emailOrUsername,
      password,
    });

    const authPayload = {
      ...response.data.user,
      token: response.data.token,
      user: response.data.user,
    };

    setUser(authPayload);
    if (rememberMe) {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(authPayload));
    } else {
      sessionStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(authPayload));
    }
    return authPayload;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_AUTH_KEY);
    sessionStorage.removeItem(STORAGE_AUTH_KEY);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

