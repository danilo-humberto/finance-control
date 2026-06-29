import type { User } from '@prisma/client';

import { toUserResponseDto } from './user-response.dto';

describe('toUserResponseDto', () => {
  it('maps user data without exposing firebase uid', () => {
    const now = new Date('2026-06-29T10:00:00.000Z');
    const user: User = {
      id: '11111111-1111-4111-8111-111111111111',
      firebaseUid: 'firebase-uid',
      name: 'Danilo Humberto',
      email: 'danilo@example.com',
      photoUrl: 'https://example.com/photo.png',
      createdAt: now,
      updatedAt: now,
    };

    const response = toUserResponseDto(user);

    expect(response).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    expect(response).not.toHaveProperty('firebaseUid');
  });
});
