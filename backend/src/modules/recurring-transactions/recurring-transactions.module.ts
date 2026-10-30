import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransactionsService } from './recurring-transactions.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [RecurringTransactionsController],
  providers: [RecurringTransactionsService],
  exports: [RecurringTransactionsService],
})
export class RecurringTransactionsModule {}
