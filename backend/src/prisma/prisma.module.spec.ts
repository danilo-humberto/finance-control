import { Test, TestingModule } from '@nestjs/testing';

import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

describe('PrismaModule', () => {
  let moduleRef: TestingModule;

  afterEach(async () => {
    await moduleRef?.close();
  });

  it('provides PrismaService for feature modules', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    const prismaService = moduleRef.get(PrismaService);

    expect(prismaService).toBeDefined();
    expect(prismaService).toHaveProperty('$connect');
  });
});
