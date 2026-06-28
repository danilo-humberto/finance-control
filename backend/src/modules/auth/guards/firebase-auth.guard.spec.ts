import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { User } from '@prisma/client';

import type { PrismaService } from '../../../prisma/prisma.service';
import type { FirebaseAdminService } from '../firebase-admin.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

type RequestStub = {
  headers: {
    authorization?: string;
  };
  user?: User;
};

function createContext(request: RequestStub): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('FirebaseAuthGuard', () => {
  let firebaseAdminService: {
    verifyIdToken: jest.Mock;
  };
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let guard: FirebaseAuthGuard;

  const user: User = {
    id: '9b9f81b3-26b8-4f07-94fc-d66cf4175e4e',
    firebaseUid: 'firebase-user-id',
    email: 'user@example.com',
    name: 'User Name',
    photoUrl: 'https://example.com/user.png',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    firebaseAdminService = {
      verifyIdToken: jest.fn(),
    };
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    guard = new FirebaseAuthGuard(
      firebaseAdminService as unknown as FirebaseAdminService,
      prismaService as unknown as PrismaService,
    );
  });

  it('rejects requests without an authorization token', async () => {
    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(firebaseAdminService.verifyIdToken).not.toHaveBeenCalled();
    expect(prismaService.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects authorization headers without the bearer format', async () => {
    await expect(
      guard.canActivate(
        createContext({
          headers: {
            authorization: 'Token valid-token',
          },
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(firebaseAdminService.verifyIdToken).not.toHaveBeenCalled();
    expect(prismaService.user.findUnique).not.toHaveBeenCalled();
  });

  it('attaches an existing user to the request', async () => {
    const request: RequestStub = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    firebaseAdminService.verifyIdToken.mockResolvedValue({
      uid: user.firebaseUid,
      email: user.email,
      name: user.name,
      picture: user.photoUrl,
    });
    prismaService.user.findUnique.mockResolvedValue(user);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(firebaseAdminService.verifyIdToken).toHaveBeenCalledWith(
      'valid-token',
    );
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        firebaseUid: user.firebaseUid,
      },
    });
    expect(prismaService.user.create).not.toHaveBeenCalled();
    expect(prismaService.user.update).not.toHaveBeenCalled();
    expect(request.user).toEqual(user);
  });

  it('updates an existing user with fresh firebase claims', async () => {
    const request: RequestStub = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };
    const updatedUser: User = {
      ...user,
      email: 'updated@example.com',
      name: 'Updated Name',
      photoUrl: 'https://example.com/updated.png',
    };

    firebaseAdminService.verifyIdToken.mockResolvedValue({
      uid: user.firebaseUid,
      email: updatedUser.email,
      name: updatedUser.name,
      picture: updatedUser.photoUrl,
    });
    prismaService.user.findUnique.mockResolvedValue(user);
    prismaService.user.update.mockResolvedValue(updatedUser);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: user.id,
      },
      data: {
        email: updatedUser.email,
        name: updatedUser.name,
        photoUrl: updatedUser.photoUrl,
      },
    });
    expect(request.user).toEqual(updatedUser);
  });

  it('creates and attaches the user when the firebase uid is unknown', async () => {
    const request: RequestStub = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    firebaseAdminService.verifyIdToken.mockResolvedValue({
      uid: user.firebaseUid,
      email: user.email,
      name: user.name,
      picture: user.photoUrl,
    });
    prismaService.user.findUnique.mockResolvedValue(null);
    prismaService.user.create.mockResolvedValue(user);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    });
    expect(request.user).toEqual(user);
  });

  it('rejects new users when the firebase token has no email', async () => {
    firebaseAdminService.verifyIdToken.mockResolvedValue({
      uid: user.firebaseUid,
    });
    prismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createContext({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prismaService.user.create).not.toHaveBeenCalled();
  });
});
