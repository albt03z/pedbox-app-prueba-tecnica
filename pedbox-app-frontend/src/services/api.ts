import { env } from '@/config/env';
import { tokenStorage } from './token-storage';

const baseUrl = env.apiUrl.replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  /** Si es false, no se manda el header Authorization (login/register). */
  auth?: boolean;
}

/**
 * Wrapper central de fetch. Inyecta el JWT en el header Authorization
 * salvo que se desactive explícitamente, y normaliza los errores HTTP
 * en una ApiError con el status y el mensaje que devuelve Nest
 * ({ message }) en sus excepciones.
 */
async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? tokenStorage.get() : null;

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401) {
    tokenStorage.clear();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.message ?? `Error ${response.status}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, options: RequestOptions = {}) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
