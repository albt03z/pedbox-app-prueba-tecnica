import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/services/auth.service';
import { tokenStorage } from '@/services/token-storage';
import { isTokenExpired } from '@/utils/jwt';
import type { AuthCredentials } from '@/types/auth.types';

interface AuthContextValue {
  isAuthenticated: boolean;
  /** true mientras se revisa si ya hay un token válido guardado (al montar). */
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Maneja la sesión en el frontend. Al montar, revisa si ya hay un token
 * guardado y si sigue vigente (decodificando su `exp`) para no obligar
 * a loguearse de nuevo en cada refresh, pero tampoco quedarse con un
 * token vencido como si la sesión siguiera activa.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.get();
    if (token && !isTokenExpired(token)) {
      setIsAuthenticated(true);
    } else {
      tokenStorage.clear();
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: AuthCredentials) => {
    const { accessToken } = await authService.login(credentials);
    tokenStorage.set(accessToken);
    setIsAuthenticated(true);
  };

  const register = async (credentials: AuthCredentials) => {
    const { accessToken } = await authService.register(credentials);
    tokenStorage.set(accessToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    tokenStorage.clear();
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, login, register, logout }),
    [isAuthenticated, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
