interface DecodedToken {
  sub: string;
  email: string;
  exp: number;
}

/**
 * Decodifica el payload de un JWT sin verificar la firma — la
 * verificación real siempre la hace el backend. Esto solo se usa en el
 * frontend para saber si el token ya expiró y así cerrar sesión
 * proactivamente en vez de esperar a que un request falle con 401.
 */
function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}
