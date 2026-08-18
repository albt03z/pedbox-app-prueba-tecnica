export interface AuthCredentials {
  email: string;
  password: string;
}

/** Respuesta de /auth/login y /auth/register. */
export interface AuthResponse {
  accessToken: string;
}
