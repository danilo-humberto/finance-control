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

export class UpdateCreditCardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  lastFourDigits?: string;

  @Type(() => Number)
  @IsNumber()
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
