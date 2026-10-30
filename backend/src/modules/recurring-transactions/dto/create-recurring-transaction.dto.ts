import { PaymentMethod, TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateRecurringTransactionDto {
  @IsUUID()
  @IsOptional()
  creditCardId?: string;

  @IsUUID()
  categoryId!: string;

  @IsUUID()
  @IsOptional()
  subcategoryId?: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsEnum(TransactionType)
  @IsOptional()
  transactionType?: TransactionType = TransactionType.EXPENSE;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod = PaymentMethod.CREDIT_CARD;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  billingDay!: number;

  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}
