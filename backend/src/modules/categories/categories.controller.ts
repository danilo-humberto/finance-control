import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { type CategoryResponse, CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(FirebaseAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoriesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User): Promise<CategoryResponse[]> {
    return this.categoriesService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<CategoryResponse> {
    return this.categoriesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<CategoryResponse> {
    return this.categoriesService.remove(user.id, id);
  }
}
