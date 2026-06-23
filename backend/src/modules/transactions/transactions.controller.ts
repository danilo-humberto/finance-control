import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { Transaction, User } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(FirebaseAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User): Promise<Transaction[]> {
    return this.transactionsService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<Transaction> {
    return this.transactionsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<Transaction> {
    return this.transactionsService.remove(user.id, id);
  }
}
