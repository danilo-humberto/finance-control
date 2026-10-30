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
    if (dto.parentId) {
      const parent = await this.findOwnedCategory(userId, dto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found.');
      }
      if (parent.parentId) {
        throw new BadRequestException(
          'Subcategories cannot have child subcategories.',
        );
      }
      if (dto.type && dto.type !== parent.type) {
        throw new BadRequestException(
          'Subcategory type must match parent category type.',
        );
      }
    }

    const category = await this.prismaService.category.create({
      data: {
        userId,
        name: dto.name,
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        type: dto.type,
        parentId: dto.parentId ?? null,
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
    const existing = await this.findOwnedCategory(userId, id);
    if (!existing) {
      throw new NotFoundException('Category not found.');
    }

    const effectiveParentId =
      dto.parentId !== undefined ? dto.parentId : existing.parentId;

    if (dto.parentId !== undefined && dto.parentId !== null) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent.');
      }

      const hasChildren = await this.prismaService.category.count({
        where: {
          parentId: id,
          userId,
        },
      });

      if (hasChildren > 0) {
        throw new BadRequestException(
          'A category with subcategories cannot become a subcategory.',
        );
      }

      const parent = await this.findOwnedCategory(userId, dto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found.');
      }
      if (parent.parentId) {
        throw new BadRequestException(
          'Subcategories cannot have child subcategories.',
        );
      }

      const effectiveType = dto.type ?? existing.type;
      if (effectiveType !== parent.type) {
        throw new BadRequestException(
          'Subcategory type must match parent category type.',
        );
      }
    } else if (effectiveParentId) {
      if (dto.type && dto.type !== existing.type) {
        const parent = await this.findOwnedCategory(userId, effectiveParentId);
        if (parent && dto.type !== parent.type) {
          throw new BadRequestException(
            'Subcategory type must match parent category type.',
          );
        }
      }
    } else {
      if (dto.type && dto.type !== existing.type) {
        await this.prismaService.category.updateMany({
          where: {
            parentId: id,
            userId,
          },
          data: {
            type: dto.type,
          },
        });
      }
    }

    const category = await this.prismaService.category.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        icon: dto.icon,
        color: dto.color,
        type: dto.type,
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
      },
    });

    return this.mapCategory(category);
  }

  async remove(userId: string, id: string): Promise<CategoryResponse> {
    await this.findOne(userId, id);

    const subcategories = await this.prismaService.category.findMany({
      where: {
        parentId: id,
        userId,
      },
      select: {
        id: true,
      },
    });
    const allCategoryIds = [id, ...subcategories.map((s) => s.id)];

    const linkedTransactionsCount = await this.prismaService.transaction.count({
      where: {
        userId,
        OR: [
          { categoryId: { in: allCategoryIds } },
          { subcategoryId: { in: allCategoryIds } },
        ],
      },
    });

    if (linkedTransactionsCount > 0) {
      throw new BadRequestException(
        'Category cannot be deleted because it or its subcategories are in use.',
      );
    }

    const linkedRecurringCount =
      await this.prismaService.recurringTransaction.count({
        where: {
          userId,
          OR: [
            { categoryId: { in: allCategoryIds } },
            { subcategoryId: { in: allCategoryIds } },
          ],
        },
      });

    if (linkedRecurringCount > 0) {
      throw new BadRequestException(
        'Category cannot be deleted because it or its subcategories are in use in recurring transactions.',
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
      parentId: category.parentId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
