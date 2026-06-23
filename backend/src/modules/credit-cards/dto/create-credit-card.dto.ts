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

export class CreateCreditCardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  lastFourDigits?: string;

  @Type(() => Number)
  @IsNumber()
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
