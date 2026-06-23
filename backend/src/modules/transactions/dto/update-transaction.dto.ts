import { PaymentMethod, TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  creditCardId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(TransactionType)
  @IsOptional()
  transactionType?: TransactionType;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  purchaseDate?: Date;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  installmentsCount?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  invoiceStartMonth?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  invoiceStartYear?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
