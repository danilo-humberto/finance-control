import { PaymentMethod, TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class UpdateRecurringTransactionDto {
  @IsUUID()
  @IsOptional()
  creditCardId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsEnum(TransactionType)
  @IsOptional()
  transactionType?: TransactionType;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  billingDay?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
