import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { useAuth } from '../../hooks/useAuth';

export function PrivateRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Carregando sessão..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
