import { CategoryType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;

  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}
