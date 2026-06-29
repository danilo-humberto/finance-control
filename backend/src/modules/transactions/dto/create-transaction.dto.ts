import { PaymentMethod, TransactionType } from "@prisma/client";
import { Type } from "class-transformer";
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
} from "class-validator";

export class CreateTransactionDto {
  @IsUUID()
  @IsOptional()
  creditCardId?: string;

  @IsUUID()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
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
