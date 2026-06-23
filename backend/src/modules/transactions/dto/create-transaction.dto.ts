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
  Max,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsOptional()
  creditCardId?: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @Type(() => Date)
  @IsDate()
  purchaseDate!: Date;

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
