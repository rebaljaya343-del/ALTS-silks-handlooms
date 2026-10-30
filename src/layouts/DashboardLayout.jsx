import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

const PAGE_TITLES = {
  '/': 'Executive Dashboard',
  '/sarees': 'Saree Catalog & Inventory Items',
  '/customers': 'Customer Directory & Profiles',
  '/inventory': 'Stock Levels & Audit Logs',
  '/sales': 'Sales Billing & POS Terminal',
  '/employees': 'Staff Directory & Permissions',
  '/reports': 'Financial & Analytics Reports',
  '/shop': 'ALTS Silks Storefront',
  '/shop/cart': 'Shopping Cart',
  '/shop/checkout': 'Checkout',
};

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = PAGE_TITLES[location.pathname] || 'Saree Portal';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 flex">
      {/* Toast notifications provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#4A0815',
            color: '#FAF4E2',
            border: '1px solid #D4AF37',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#4A0815',
            },
          },
        }}
      />

      {/* Persistent / Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} pageTitle={currentTitle} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
