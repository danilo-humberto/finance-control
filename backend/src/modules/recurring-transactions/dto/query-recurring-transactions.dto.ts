import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class QueryRecurringTransactionsDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isActive?: boolean;

  @IsUUID()
  @IsOptional()
  creditCardId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
