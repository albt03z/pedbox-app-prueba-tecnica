import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Módulo de autenticación: registro/login (AuthService) y la
 * infraestructura de validación de tokens (JwtStrategy + PassportModule)
 * que usa JwtAuthGuard para proteger rutas en otros módulos.
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // La librería jsonwebtoken tipa expiresIn como un literal de
          // patrones ("1d", "2h", ...) en vez de `string` genérico; el
          // valor viene validado por nosotros vía .env, así que el cast
          // es seguro.
          expiresIn: configService.get<string>(
            'JWT_EXPIRES_IN',
          ) as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
