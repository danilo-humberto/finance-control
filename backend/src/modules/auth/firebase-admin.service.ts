import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { App } from 'firebase-admin/app';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAdminService {
  constructor(private readonly configService: ConfigService) {}

  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    const firebaseApp = await this.getFirebaseApp();
    const { getAuth } = await import('firebase-admin/auth');

    return getAuth(firebaseApp).verifyIdToken(token);
  }

  private async getFirebaseApp(): Promise<App> {
    const firebaseConfig = this.getFirebaseConfig();
    const { cert, getApp, getApps, initializeApp } = await import(
      'firebase-admin/app'
    );

    if (getApps().length > 0) {
      return getApp();
    }

    return initializeApp({
      credential: cert(firebaseConfig),
    });
  }

  private getFirebaseConfig(): {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  } {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new UnauthorizedException('Firebase Admin is not configured.');
    }

    return {
      projectId,
      clientEmail,
      privateKey,
    };
  }
}
