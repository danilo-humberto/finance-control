import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Category } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export type CategoryResponse = Omit<Category, 'userId'>;

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<CategoryResponse> {
    const category = await this.prismaService.category.create({
      data: {
        userId,
        name: dto.name,
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        type: dto.type,
      },
    });

    return this.mapCategory(category);
  }

  async findAll(userId: string): Promise<CategoryResponse[]> {
    const categories = await this.prismaService.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return categories.map((category) => this.mapCategory(category));
  }

  async findOne(userId: string, id: string): Promise<CategoryResponse> {
    const category = await this.findOwnedCategory(userId, id);

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return this.mapCategory(category);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    await this.findOne(userId, id);

    const category = await this.prismaService.category.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        icon: dto.icon,
        color: dto.color,
        type: dto.type,
      },
    });

    return this.mapCategory(category);
  }

  async remove(userId: string, id: string): Promise<CategoryResponse> {
    await this.findOne(userId, id);

    const linkedTransactionsCount =
      await this.prismaService.transaction.count({
        where: {
          categoryId: id,
          userId,
        },
      });

    if (linkedTransactionsCount > 0) {
      throw new BadRequestException(
        'Category cannot be deleted because it is in use.',
      );
    }

    const category = await this.prismaService.category.delete({
      where: {
        id,
      },
    });

    return this.mapCategory(category);
  }

  private findOwnedCategory(
    userId: string,
    id: string,
  ): Promise<Category | null> {
    return this.prismaService.category.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  private mapCategory(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
