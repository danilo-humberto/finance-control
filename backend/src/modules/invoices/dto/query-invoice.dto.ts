import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class QueryInvoiceDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(9999)
  year!: number;

  @IsUUID()
  @IsOptional()
  creditCardId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
