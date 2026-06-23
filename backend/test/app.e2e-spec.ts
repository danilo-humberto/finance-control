import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:net';
import request from 'supertest';

import { AppModule } from './../src/app.module';

describe('Health route (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns the API health status', () => {
    const httpServer = app.getHttpServer() as Server;

    return request(httpServer)
      .get('/health')
      .expect(200)
      .expect({
        status: 'ok',
        service: 'finance-control-api',
      });
  });

  it('GET /auth/me without token returns unauthorized', () => {
    const httpServer = app.getHttpServer() as Server;

    return request(httpServer).get('/auth/me').expect(401);
  });
});
