import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  // bufferLogs: true retiene los logs de arranque hasta que el logger
  // de Pino (registrado más abajo) esté listo, para no perder nada.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Reemplaza el logger interno de Nest por Pino: cualquier
  // `new Logger(...)` de @nestjs/common usado en el resto del código
  // (ej. SeedService, RickAndMortyApiService) queda automáticamente
  // enrutado a través de Pino sin tener que tocar esos archivos.
  app.useLogger(app.get(Logger));

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

  /**
   * Documentación OpenAPI/Swagger, generada a partir de los DTOs y
   * decoradores @Api* de los controllers. addBearerAuth() agrega el
   * botón "Authorize" en la UI para probar los endpoints protegidos
   * pegando el JWT obtenido en /auth/login.
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PedBox — Rick and Morty API')
    .setDescription(
      'API REST que normaliza y expone datos de la Rick and Morty API, con autenticación JWT.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
