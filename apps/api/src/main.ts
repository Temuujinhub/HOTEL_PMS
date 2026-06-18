import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({
    origin: config.get<string[]>('corsOrigins'),
    credentials: true,
  });

  app.setGlobalPrefix('api', { exclude: ['health', 'health/(.*)'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  // OpenAPI / Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cloud MASTR PMS API')
    .setDescription('Multi-tenant hotel & property management system API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth')
    .addTag('Reservations')
    .addTag('Rooms')
    .addTag('Guests')
    .addTag('Housekeeping')
    .addTag('Finance')
    .addTag('Analytics')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('port') as number;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`🚀 Cloud MASTR PMS API listening on http://localhost:${port}  (docs: /api/docs)`);
}

bootstrap();
