import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsModule } from './locations/locations.module';
import { EpisodesModule } from './episodes/episodes.module';
import { CharactersModule } from './characters/characters.module';

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
      }),
    }),
    LocationsModule,
    EpisodesModule,
    CharactersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
