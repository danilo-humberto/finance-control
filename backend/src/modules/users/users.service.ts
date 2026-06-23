import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

@Injectable()
export class UsersService {
  getCurrentUser(user: User): User {
    return user;
  }
}
