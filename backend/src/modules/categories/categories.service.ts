import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Category } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    return this.prismaService.category.create({
      data: {
        userId,
        name: dto.name,
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        type: dto.type,
      },
    });
  }

  findAll(userId: string): Promise<Category[]> {
    return this.prismaService.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string): Promise<Category> {
    const category = await this.findOwnedCategory(userId, id);

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.findOne(userId, id);

    return this.prismaService.category.update({
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
  }

  async remove(userId: string, id: string): Promise<Category> {
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

    return this.prismaService.category.delete({
      where: {
        id,
      },
    });
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
}
