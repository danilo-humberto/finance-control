import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  MAX_CREDIT_CARD_LIMIT_AMOUNT,
  MIN_CREDIT_CARD_LIMIT_AMOUNT,
} from './credit-card-validation.constants';

export class CreateCreditCardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  lastFourDigits?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(MIN_CREDIT_CARD_LIMIT_AMOUNT)
  @Max(MAX_CREDIT_CARD_LIMIT_AMOUNT)
  limitAmount!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  closingDay!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay!: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
