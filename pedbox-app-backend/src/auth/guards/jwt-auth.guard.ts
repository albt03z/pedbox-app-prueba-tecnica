import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protege rutas exigiendo un JWT válido en el header Authorization.
 * Usa la JwtStrategy registrada bajo el nombre 'jwt' por PassportStrategy.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
