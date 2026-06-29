import { Controller, Get, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { type UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User): UserResponseDto {
    return this.usersService.getCurrentUser(user);
  }
}
