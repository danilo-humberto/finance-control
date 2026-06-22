import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = moduleRef.get<HealthController>(HealthController);
  });

  it('returns the API health status', () => {
    expect(controller.getHealth()).toEqual({
      status: 'ok',
      service: 'finance-control-api',
    });
  });
});
