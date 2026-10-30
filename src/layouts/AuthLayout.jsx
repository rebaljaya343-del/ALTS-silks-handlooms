import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#2C030B] flex items-center justify-center p-4 selection:bg-gold-500 selection:text-maroon-950">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#4A0815',
            color: '#FAF4E2',
            border: '1px solid #D4AF37',
          },
        }}
      />
      <Outlet />
    </div>
  );
};
