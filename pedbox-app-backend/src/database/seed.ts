import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from '../rick-and-morty/seed.service';

/**
 * Script standalone para poblar la base de datos desde la Rick and Morty
 * API. Se ejecuta aparte del servidor HTTP (`npm run seed`) para no
 * forzar un fetch completo a la API externa cada vez que se levanta la
 * app en desarrollo con start:dev.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.run();
  } finally {
    await app.close();
  }
}

bootstrap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed falló:', error);
    process.exit(1);
  });
