const TOKEN_KEY = 'pedbox_access_token';

/**
 * Aísla el acceso a localStorage en un solo módulo — si el día de mañana
 * se cambia a otro mecanismo de almacenamiento, solo se toca este archivo.
 */
export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};
