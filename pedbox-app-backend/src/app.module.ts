import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { LocationsModule } from './locations/locations.module';
import { EpisodesModule } from './episodes/episodes.module';
import { CharactersModule } from './characters/characters.module';
import { RickAndMortyModule } from './rick-and-morty/rick-and-morty.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    /**
     * Carga la configuración de variables de entorno desde el archivo
     * .env y la hace disponible globalmente en toda la aplicación.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    /**
     * Logging estructurado con Pino, en reemplazo del logger por defecto
     * de Nest. Reemplaza automáticamente cualquier `new Logger(...)` de
     * @nestjs/common usado en el resto del código (ver main.ts,
     * app.useLogger) y agrega logging automático de cada request HTTP
     * (método, ruta, status, tiempo de respuesta).
     *
     * - En una terminal interactiva real: salida legible y con color
     *   (pino-pretty). Nunca dentro de Docker: process.stdout.isTTY es
     *   false ahí sin importar NODE_ENV, y pino-pretty ni siquiera está
     *   instalado en la imagen final (es una devDependency) — usar
     *   NODE_ENV para esta decisión rompía el arranque en el contenedor.
     * - En cualquier otro caso (Docker, CI, producción real): JSON plano
     *   por stdout, listo para un agregador de logs (Datadog, CloudWatch, Loki, etc.).
     * - redact: nunca se loguea el header Authorization ni la
     *   contraseña en texto plano del body de /auth/register o /auth/login.
     */
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const usePrettyTransport = Boolean(process.stdout.isTTY) && !isProduction;

        return {
          pinoHttp: {
            level: isProduction ? 'info' : 'debug',
            transport: usePrettyTransport
              ? {
                  target: 'pino-pretty',
                  options: { colorize: true, singleLine: true },
                }
              : undefined,
            redact: {
              paths: [
                'req.headers.authorization',
                'req.body.password',
                'res.headers',
              ],
              censor: '**REDACTED**',
            },
          },
        };
      },
    }),
    /**
     * Configura la conexión a la base de datos PostgreSQL utilizando TypeORM.
     * La configuración se obtiene de las variables de entorno cargadas por ConfigModule.
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        // Proveedores de Postgres en la nube (Neon, Supabase, etc.) exigen
        // SSL; el Postgres local de docker-compose no lo necesita ni lo
        // soporta configurado así — por eso es un toggle explícito por
        // env var y no algo inferido de NODE_ENV.
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    LocationsModule,
    EpisodesModule,
    CharactersModule,
    RickAndMortyModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
