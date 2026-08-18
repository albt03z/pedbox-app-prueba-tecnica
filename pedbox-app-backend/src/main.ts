import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Valida y transforma automáticamente los DTOs de entrada en todos
   * los endpoints (class-validator + class-transformer).
   * - whitelist: descarta cualquier propiedad no declarada en el DTO
   *   (evita mass-assignment de campos que el cliente no debería enviar).
   * - forbidNonWhitelisted: en vez de solo descartarlas, rechaza la
   *   petición si llegan propiedades extra — errores más claros al frontend.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // El frontend (Vite/React) corre en otro origen (puerto distinto) en desarrollo.
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
