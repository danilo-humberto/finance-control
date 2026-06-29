import type { User } from '@prisma/client';

export class UserResponseDto {
  id!: string;
  name!: string | null;
  email!: string;
  photoUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
