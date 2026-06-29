import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

import {
  toUserResponseDto,
  type UserResponseDto,
} from './dto/user-response.dto';

@Injectable()
export class UsersService {
  getCurrentUser(user: User): UserResponseDto {
    return toUserResponseDto(user);
  }
}
