import { useEffect, useState } from 'react';

/**
 * Retrasa la actualización de un valor hasta que dejen de llegar cambios
 * por `delayMs`. Se usa en el buscador de personajes para no disparar
 * un request al backend en cada tecla.
 */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
