import { Controller, Get } from '@nestjs/common';

type HealthResponse = {
  status: 'ok';
  service: 'finance-control-api';
};

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'finance-control-api',
    };
  }
}
