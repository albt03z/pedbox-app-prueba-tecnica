import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Layout compartido por todas las rutas protegidas: header fijo con
 * logout + contenedor centrado para el contenido de cada página. Le da
 * consistencia de navegación a toda la sección autenticada.
 */
export function AppShell() {
  const { logout } = useAuth();

  return (
    <div className="min-h-svh bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/characters" className="text-base font-semibold text-slate-900">
            PedBox <span className="text-purple-600">· Rick and Morty</span>
          </Link>
          <button
            onClick={logout}
            className="text-sm font-medium text-slate-600 hover:text-purple-600"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}
