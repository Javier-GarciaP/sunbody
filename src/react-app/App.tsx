import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from '@/react-app/context/ThemeContext';
import { AuthProvider } from '@/react-app/context/AuthContext';
import { ToastProvider } from '@/react-app/context/ToastContext';
import { ProtectedRoute } from '@/react-app/components/ProtectedRoute';
import MainLayout from '@/react-app/components/layout/MainLayout';
import Dashboard from '@/react-app/pages/Dashboard';
import InventoryPage from '@/react-app/pages/InventoryPage';
import CustomersPage from '@/react-app/pages/CustomersPage';
import POSPage from '@/react-app/pages/POSPage';
import TransactionsPage from '@/react-app/pages/TransactionsPage';
import SettingsPage from '@/react-app/pages/SettingsPage';
import OrdersPage from '@/react-app/pages/OrdersPage';
import { LoginPage } from '@/react-app/pages/LoginPage';
import NotFoundPage from '@/react-app/pages/NotFoundPage';
import { LoadingScreen } from '@/react-app/components/ui/LoadingScreen';
import { useAuth } from '@/react-app/context/AuthContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
