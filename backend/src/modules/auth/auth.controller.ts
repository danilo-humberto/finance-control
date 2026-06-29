import { Controller, Get, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';

import {
  toUserResponseDto,
  type UserResponseDto,
} from '../users/dto/user-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  getMe(@CurrentUser() user: User): UserResponseDto {
    return toUserResponseDto(user);
  }
}
