import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { AppModule } from '../src/app.module';
import {
  createCorsOriginValidator,
  parseCorsOrigins,
} from '../src/common/config/cors-options';

type HttpHandler = (req: IncomingMessage, res: ServerResponse) => void;

let cachedServer: HttpHandler | null = null;

async function bootstrapServer(): Promise<HttpHandler> {
  if (cachedServer) {
    return cachedServer;
  }

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  const allowedOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);

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

  await app.init();

  cachedServer = server as HttpHandler;

  return cachedServer;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const server = await bootstrapServer();

  if (req.url?.startsWith('/api')) {
    const rewrittenUrl = req.url.replace(/^\/api(?=\/|\?|$)/, '') || '/';
    req.url = rewrittenUrl.startsWith('?') ? `/${rewrittenUrl}` : rewrittenUrl;
  }

  return server(req, res);
}
