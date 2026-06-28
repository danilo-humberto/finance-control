import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase-admin.service';
import type { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);
    const decodedToken = await this.firebaseAdminService.verifyIdToken(token);

    request.user = await this.findOrCreateUser({
      email: decodedToken.email,
      firebaseUid: decodedToken.uid,
      name: this.getOptionalStringClaim(decodedToken, 'name'),
      photoUrl: this.getOptionalStringClaim(decodedToken, 'picture'),
    });

    return true;
  }

  private extractBearerToken(authorization?: string | string[]): string {
    const headerValue = Array.isArray(authorization)
      ? authorization[0]
      : authorization;

    if (!headerValue) {
      throw new UnauthorizedException('Authorization token is required.');
    }

    const [type, token, ...extraParts] = headerValue.trim().split(/\s+/);

    if (type !== 'Bearer' || !token || extraParts.length > 0) {
      throw new UnauthorizedException('Authorization must use Bearer token.');
    }

    return token;
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
