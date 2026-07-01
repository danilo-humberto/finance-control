import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import {
  createCorsOriginValidator,
  parseCorsOrigins,
} from './common/config/cors-options';

const DEFAULT_CORS_ORIGINS = ['http://localhost:5173'];

function parsePort(value: string | undefined): number {
  const parsedPort = Number.parseInt(value ?? '3000', 10);

  if (Number.isNaN(parsedPort) || parsedPort < 1) {
    return 3000;
  }

  return parsedPort;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const allowedOrigins = parseCorsOrigins(
    configService.get<string>('CORS_ORIGIN'),
    DEFAULT_CORS_ORIGINS,
  );

  app.enableCors({
    credentials: true,
    origin: createCorsOriginValidator(allowedOrigins),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  await app.listen(parsePort(configService.get<string>('PORT')), '0.0.0.0');
}

void bootstrap();
