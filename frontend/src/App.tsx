import { AppRoutes } from './app/routes/AppRoutes';
import { InstallAppToast } from './components/pwa/InstallAppToast';
import { PwaUpdateToast } from './components/pwa/PwaUpdateToast';
import { AuthProvider } from './contexts/AuthContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AuthProvider>
          <AppRoutes />
          <InstallAppToast />
          <PwaUpdateToast />
        </AuthProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
