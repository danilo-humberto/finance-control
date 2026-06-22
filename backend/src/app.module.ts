import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CategoriesModule } from './modules/categories/categories.module';
import { CreditCardsModule } from './modules/credit-cards/credit-cards.module';
import { HealthModule } from './modules/health/health.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    HealthModule,
    UsersModule,
    CreditCardsModule,
    CategoriesModule,
    TransactionsModule,
    InvoicesModule,
  ],
})
export class AppModule {}
