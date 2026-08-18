import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

/** Forma del payload firmado al hacer login (ver AuthService.signToken). */
export interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * Estrategia Passport que valida el JWT recibido en el header
 * `Authorization: Bearer <token>`. Lo que retorna `validate()` queda
 * disponible como `request.user` en los controllers protegidos por
 * JwtAuthGuard.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
