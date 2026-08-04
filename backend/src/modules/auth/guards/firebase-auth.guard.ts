import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase-admin.service';
import type { AuthenticatedRequest } from '../types/authenticated-request';

type AuthorizationHeader = string | string[] | undefined;

const invalidFirebaseTokenErrorCodes = new Set([
  'auth/id-token-expired',
  'auth/id-token-revoked',
  'auth/invalid-id-token',
  'auth/user-disabled',
]);

const invalidFirebaseTokenMessagePatterns = [
  /^Decoding Firebase ID token failed\./i,
  /^Firebase ID token has /i,
  /^First argument to verifyIdToken\(\) must be a Firebase ID token string\./i,
  /^verifyIdToken\(\) expects an ID token/i,
];

function getAuthorizationHeader(
  request: AuthenticatedRequest,
): string | undefined {
  const rawHeader: AuthorizationHeader =
    request.headers?.authorization ?? request.headers?.Authorization;
  const header = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  return typeof header === 'string' ? header : undefined;
}

function extractBearerToken(request: AuthenticatedRequest): string | null {
  const header = getAuthorizationHeader(request);

  if (!header) {
    return null;
  }

  const [scheme, token, ...extraParts] = header.trim().split(/\s+/);

  if (scheme !== 'Bearer' || !token || extraParts.length > 0) {
    return null;
  }

  return token;
}

function getErrorLogData(error: unknown): {
  code?: unknown;
  message?: unknown;
} {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const errorRecord = error as Record<string, unknown>;

  return {
    code: errorRecord.code,
    message: errorRecord.message,
  };
}

function isFirebaseTokenValidationError(error: unknown): boolean {
  const { code, message } = getErrorLogData(error);

  if (typeof code !== 'string') {
    return false;
  }

  if (invalidFirebaseTokenErrorCodes.has(code)) {
    return true;
  }

  if (code !== 'auth/argument-error') {
    return false;
  }

  return invalidFirebaseTokenMessagePatterns.some(
    (pattern) => typeof message === 'string' && pattern.test(message),
  );
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorizationHeader = getAuthorizationHeader(request);

    console.log('[AuthGuard] Authorization header received', {
      hasHeader: Boolean(
        request.headers?.authorization ?? request.headers?.Authorization,
      ),
      headerPrefix: authorizationHeader?.slice(0, 10),
    });

    const token = extractBearerToken(request);

    if (!token) {
      console.warn('[AuthGuard] Missing or invalid Authorization header', {
        hasAuthorizationLower: Boolean(request.headers?.authorization),
        hasAuthorizationUpper: Boolean(request.headers?.Authorization),
      });

      throw new UnauthorizedException('Missing authorization token');
    }

    let decodedToken: Awaited<
      ReturnType<FirebaseAdminService['verifyIdToken']>
    >;

    try {
      decodedToken = await this.firebaseAdminService.verifyIdToken(token);
    } catch (error) {
      console.error(
        '[AuthGuard] Firebase token validation failed',
        getErrorLogData(error),
      );

      if (error instanceof HttpException) {
        throw error;
      }

      if (isFirebaseTokenValidationError(error)) {
        throw new UnauthorizedException(
          'Invalid Firebase authentication token.',
        );
      }

      throw new ServiceUnavailableException(
        'Firebase authentication service is unavailable.',
      );
    }

    request.user = await this.findOrCreateUser({
      email: decodedToken.email,
      firebaseUid: decodedToken.uid,
      name: this.getOptionalStringClaim(decodedToken, 'name'),
      photoUrl: this.getOptionalStringClaim(decodedToken, 'picture'),
    });

    return true;
  }

  private getOptionalStringClaim(
    decodedToken: object,
    claimName: string,
  ): string | undefined {
    const claimValue = (decodedToken as Record<string, unknown>)[claimName];

    return typeof claimValue === 'string' ? claimValue : undefined;
  }

  private async findOrCreateUser(params: {
    firebaseUid: string;
    email?: string;
    name?: string;
    photoUrl?: string;
  }): Promise<User> {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        firebaseUid: params.firebaseUid,
      },
    });

    if (existingUser) {
      return this.updateExistingUserFromFirebaseClaims(existingUser, params);
    }

    if (!params.email) {
      throw new UnauthorizedException(
        'Firebase token does not contain an email.',
      );
    }

    return this.prismaService.user.create({
      data: {
        firebaseUid: params.firebaseUid,
        email: params.email,
        name: params.name ?? null,
        photoUrl: params.photoUrl ?? null,
      },
    });
  }

  private async updateExistingUserFromFirebaseClaims(
    existingUser: User,
    params: {
      email?: string;
      name?: string;
      photoUrl?: string;
    },
  ): Promise<User> {
    const data: {
      email?: string;
      name?: string;
      photoUrl?: string;
    } = {};

    if (params.email && params.email !== existingUser.email) {
      data.email = params.email;
    }

    if (params.name && params.name !== existingUser.name) {
      data.name = params.name;
    }

    if (params.photoUrl && params.photoUrl !== existingUser.photoUrl) {
      data.photoUrl = params.photoUrl;
    }

    if (Object.keys(data).length === 0) {
      return existingUser;
    }

    return this.prismaService.user.update({
      where: {
        id: existingUser.id,
      },
      data,
    });
  }
}
