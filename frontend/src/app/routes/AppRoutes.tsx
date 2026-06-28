import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '../../layouts/AppLayout';
import { AuthLayout } from '../../layouts/AuthLayout';
import { ForgotPasswordPage } from '../../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { CategoriesPage } from '../../pages/categories/CategoriesPage';
import { CreditCardsPage } from '../../pages/credit-cards/CreditCardsPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { InvoicesPage } from '../../pages/invoices/InvoicesPage';
import { GeneralPreferencesPage } from '../../pages/settings/GeneralPreferencesPage';
import { ProfileSettingsPage } from '../../pages/settings/ProfileSettingsPage';
import { SettingsPage } from '../../pages/settings/SettingsPage';
import { ThemeSettingsPage } from '../../pages/settings/ThemeSettingsPage';
import { NewTransactionPage } from '../../pages/transactions/NewTransactionPage';
import { TransactionsPage } from '../../pages/transactions/TransactionsPage';
import { UiPreviewPage } from '../../pages/ui-preview/UiPreviewPage';
import { PrivateRoute } from './PrivateRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/new" element={<NewTransactionPage />} />
            <Route path="/credit-cards" element={<CreditCardsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
            <Route
              path="/settings/preferences"
              element={<GeneralPreferencesPage />}
            />
            <Route path="/settings/theme" element={<ThemeSettingsPage />} />
            <Route path="/ui-preview" element={<UiPreviewPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
