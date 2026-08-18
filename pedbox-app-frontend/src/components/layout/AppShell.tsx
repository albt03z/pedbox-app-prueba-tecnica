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
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
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
