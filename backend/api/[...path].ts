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
type VercelRequest = IncomingMessage & {
  query?: Record<string, unknown>;
};

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

function normalizeVercelRequest(req: VercelRequest): void {
  const originalUrl = req.url || '/';
  const url = new URL(originalUrl, 'http://localhost');
  const rewritePath = getRewritePath(req, url);

  url.pathname = rewritePath
    ? `/${rewritePath}`
    : url.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
  url.searchParams.delete('path');
  url.searchParams.delete('...path');

  req.url = `${url.pathname}${url.search}`;

  if (req.query && typeof req.query === 'object') {
    delete req.query.path;
    delete req.query['...path'];
  }
}

function getRewritePath(req: VercelRequest, url: URL): string | null {
  const rawPath = req.query?.path ?? url.searchParams.get('path');
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;

  if (typeof path !== 'string' || !path.trim()) {
    return null;
  }

  return path.replace(/^\/+/, '');
}

export default async function handler(
  req: VercelRequest,
  res: ServerResponse,
) {
  const server = await bootstrapServer();

  normalizeVercelRequest(req);

  return server(req, res);
}
