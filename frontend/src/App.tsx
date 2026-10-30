import { QueryClientProvider } from '@tanstack/react-query';

import { AppRoutes } from './app/routes/AppRoutes';
import { InstallAppToast } from './components/pwa/InstallAppToast';
import { PwaUpdateToast } from './components/pwa/PwaUpdateToast';
import { ToastContainer } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { queryClient } from './lib/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PreferencesProvider>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
              <ToastContainer />
              <InstallAppToast />
              <PwaUpdateToast />
            </ToastProvider>
          </AuthProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
