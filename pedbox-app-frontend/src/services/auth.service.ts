import { api } from './api';
import type { AuthCredentials, AuthResponse } from '@/types/auth.types';

/** auth: false porque todavía no existe un token cuando se llama a esto. */
export const authService = {
  login: (credentials: AuthCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials, { auth: false }),
  register: (credentials: AuthCredentials) =>
    api.post<AuthResponse>('/auth/register', credentials, { auth: false }),
};
