import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { DeleteRecurringTransactionDto } from './dto/delete-recurring-transaction.dto';
import { QueryRecurringTransactionsDto } from './dto/query-recurring-transactions.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import {
  RecurringTransactionResponse,
  RecurringTransactionsService,
} from './recurring-transactions.service';

@Controller('recurring-transactions')
@UseGuards(FirebaseAuthGuard)
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponse> {
    return this.recurringTransactionsService.create(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: QueryRecurringTransactionsDto,
  ): Promise<RecurringTransactionResponse[]> {
    return this.recurringTransactionsService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RecurringTransactionResponse> {
    return this.recurringTransactionsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponse> {
    return this.recurringTransactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: DeleteRecurringTransactionDto,
  ): Promise<RecurringTransactionResponse> {
    return this.recurringTransactionsService.remove(user.id, id, query);
  }
}
