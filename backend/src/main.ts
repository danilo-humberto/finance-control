import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

function parsePort(value: string | undefined): number {
  const parsedPort = Number.parseInt(value ?? '3000', 10);

  if (Number.isNaN(parsedPort) || parsedPort < 1) {
    return 3000;
  }

  return parsedPort;
}

function parseCorsOrigins(value: string | undefined): string[] {
  const origins = (value ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : ['http://localhost:5173'];
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    credentials: true,
    origin: parseCorsOrigins(configService.get<string>('CORS_ORIGIN')),
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

  await app.listen(parsePort(configService.get<string>('PORT')));
}

void bootstrap();
