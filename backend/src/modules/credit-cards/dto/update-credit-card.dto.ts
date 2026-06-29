import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
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

export class UpdateCreditCardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  lastFourDigits?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(MIN_CREDIT_CARD_LIMIT_AMOUNT)
  @Max(MAX_CREDIT_CARD_LIMIT_AMOUNT)
  @IsOptional()
  limitAmount?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  closingDay?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  dueDay?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
