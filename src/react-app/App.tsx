import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from '@/react-app/context/ThemeContext';
import { AuthProvider } from '@/react-app/context/AuthContext';
import { ProtectedRoute } from '@/react-app/components/ProtectedRoute';
import MainLayout from '@/react-app/components/layout/MainLayout';
import Dashboard from '@/react-app/pages/Dashboard';
import InventoryPage from '@/react-app/pages/InventoryPage';
import CustomersPage from '@/react-app/pages/CustomersPage';
import POSPage from '@/react-app/pages/POSPage';
import TransactionsPage from '@/react-app/pages/TransactionsPage';
import SettingsPage from '@/react-app/pages/SettingsPage';
import { LoginPage } from '@/react-app/pages/LoginPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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
              <Route path="/pos" element={<POSPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
