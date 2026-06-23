import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FirebaseAdminService } from './firebase-admin.service';

describe('FirebaseAdminService', () => {
  it('does not require firebase environment variables during construction', () => {
    const configService = {
      get: jest.fn(),
    };

    expect(
      () =>
        new FirebaseAdminService(configService as unknown as ConfigService),
    ).not.toThrow();
  });

  it('rejects token verification when firebase admin is not configured', async () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    };
    const service = new FirebaseAdminService(
      configService as unknown as ConfigService,
    );

    await expect(service.verifyIdToken('token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
