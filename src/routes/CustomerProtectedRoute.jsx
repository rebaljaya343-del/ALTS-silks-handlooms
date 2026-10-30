import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Skeleton } from '../components/Skeleton';

export const CustomerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useCustomerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gold-400 border-t-maroon-700 rounded-full animate-spin mx-auto" />
          <p className="font-brand text-maroon-900 font-semibold text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/shop/login" state={{ from: location }} replace />;
  }

  return children;
};
