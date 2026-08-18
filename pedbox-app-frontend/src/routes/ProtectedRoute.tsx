import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

/**
 * Envuelve rutas que requieren sesión activa. Si hay sesión válida,
 * renderiza el layout compartido (AppShell), que a su vez expone
 * <Outlet /> para las rutas hijas — así todas comparten header/nav
 * sin repetir la lógica de protección en cada una.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <AppShell />;
}
