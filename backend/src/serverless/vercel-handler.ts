import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { AppModule } from '../app.module';
import {
  createCorsOriginValidator,
  parseCorsOrigins,
} from '../common/config/cors-options';

type HttpHandler = (req: IncomingMessage, res: ServerResponse) => void;

export type VercelRequest = IncomingMessage & {
  query?: Record<string, unknown>;
};

type VercelRouteOptions = {
  routePath?: string;
};

let cachedServer: HttpHandler | null = null;
let cachedServerPromise: Promise<HttpHandler> | null = null;

async function bootstrapServer(): Promise<HttpHandler> {
  if (cachedServer) {
    return cachedServer;
  }

  cachedServerPromise ??= createServer().catch((error: unknown) => {
    cachedServerPromise = null;
    console.error(
      '[VercelHandler] Failed to bootstrap server',
      getErrorLogData(error),
    );
    throw error;
  });

  return cachedServerPromise;
}

async function createServer(): Promise<HttpHandler> {
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

function normalizeVercelRequest(
  req: VercelRequest,
  options: VercelRouteOptions,
): void {
  const originalUrl = req.url || '/';
  const url = new URL(originalUrl, 'http://localhost');
  const rewritePath = getRewritePath(req, url);
  const routePath = options.routePath?.replace(/^\/+/, '');

  url.pathname = routePath
    ? `/${routePath}`
    : rewritePath
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

export async function handleVercelRequest(
  req: VercelRequest,
  res: ServerResponse,
  options: VercelRouteOptions = {},
) {
  const server = await bootstrapServer();

  normalizeVercelRequest(req, options);

  return server(req, res);
}

export function getVercelRouteParam(
  req: VercelRequest,
  name: string,
): string {
  const value = req.query?.[name];

  if (Array.isArray(value)) {
    return String(value[0] ?? '');
  }

  return typeof value === 'string' ? value : '';
}

function getErrorLogData(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const logData: Record<string, unknown> = {
      name: error.name,
      message: redactSensitiveData(error.message),
    };

    if (process.env.NODE_ENV !== 'production' && error.stack) {
      logData.stack = redactSensitiveData(error.stack);
    }

    return logData;
  }

  if (typeof error === 'object' && error !== null) {
    const errorRecord = error as Record<string, unknown>;

    return {
      code: toSafeLogValue(errorRecord.code),
      name: toSafeLogValue(errorRecord.name),
      message: toSafeLogValue(errorRecord.message),
    };
  }

  return {
    error,
  };
}

function toSafeLogValue(value: unknown): unknown {
  return typeof value === 'string' ? redactSensitiveData(value) : value;
}

function redactSensitiveData(value: string): string {
  return value
    .replace(
      /(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+(@)/gi,
      '$1[REDACTED]$2',
    )
    .replace(
      /(password|senha|secret|token|authorization|api[_-]?key|database_url)\s*[:=]\s*([^\s,;]+)/gi,
      '$1=[REDACTED]',
    )
    .replace(
      /\b(password|senha|secret|token|authorization|api[_-]?key|database_url)\b/gi,
      '[REDACTED]',
    );
}
