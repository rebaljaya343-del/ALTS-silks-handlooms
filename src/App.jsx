import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { CustomerProtectedRoute } from './routes/CustomerProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { SareesListPage } from './pages/sarees/SareesListPage';
import { CustomersListPage } from './pages/customers/CustomersListPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { OrdersListPage } from './pages/sales/OrdersListPage';
import { OnlineOrdersPage } from './pages/orders/OnlineOrdersPage';
import { EmployeesPage } from './pages/employees/EmployeesPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { ShopPage } from './pages/shop/ShopPage';
import { CartPage } from './pages/shop/CartPage';
import { CheckoutPage } from './pages/shop/CheckoutPage';
import { CustomerLoginPage } from './pages/shop/CustomerLoginPage';
import { CustomerSignupPage } from './pages/shop/CustomerSignupPage';
import { CustomerMyOrdersPage } from './pages/shop/CustomerMyOrdersPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/shop/login" element={<CustomerLoginPage />} />
                <Route path="/shop/signup" element={<CustomerSignupPage />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/online-orders" element={<OnlineOrdersPage />} />
                <Route path="/sarees" element={<SareesListPage />} />
                <Route path="/customers" element={<CustomersListPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/sales" element={<OrdersListPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>

              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/cart" element={<CartPage />} />
              <Route path="/shop/orders" element={<CustomerProtectedRoute><CustomerMyOrdersPage /></CustomerProtectedRoute>} />
              <Route path="/shop/checkout" element={<CustomerProtectedRoute><CheckoutPage /></CustomerProtectedRoute>} />

              <Route path="*" element={<Navigate to="/shop" replace />} />
            </Routes>
          </CartProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
