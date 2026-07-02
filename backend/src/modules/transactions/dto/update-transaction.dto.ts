import { Type } from 'class-transformer';
import { PaymentMethod, TransactionType } from '@prisma/client';
import {
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

export class UpdateTransactionDto {
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

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  purchaseDate?: Date;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
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
  @Min(1900)
  @Max(9999)
  @IsOptional()
  invoiceStartYear?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
