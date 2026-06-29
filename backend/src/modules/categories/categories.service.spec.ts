import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryType, type Category } from '@prisma/client';

import type { PrismaService } from '../../prisma/prisma.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let prismaService: {
    category: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    transaction: {
      count: jest.Mock;
    };
  };
  let service: CategoriesService;

  const userId = 'user-id';
  const category: Category = {
    id: 'category-id',
    userId,
    name: 'Mercado',
    icon: 'shopping-cart',
    color: '#22c55e',
    type: CategoryType.EXPENSE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
  const categoryResponse = {
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };

  beforeEach(() => {
    prismaService = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      transaction: {
        count: jest.fn(),
      },
    };
    service = new CategoriesService(
      prismaService as unknown as PrismaService,
    );
  });

  it('creates a category using the authenticated user id', async () => {
    prismaService.category.create.mockResolvedValue(category);

    await expect(
      service.create(userId, {
        name: category.name,
        icon: category.icon ?? undefined,
        color: category.color ?? undefined,
        type: category.type,
      }),
    ).resolves.toEqual(categoryResponse);

    expect(prismaService.category.create).toHaveBeenCalledWith({
      data: {
        userId,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      },
    });
  });

  it('lists only categories from the authenticated user', async () => {
    prismaService.category.findMany.mockResolvedValue([category]);

    await expect(service.findAll(userId)).resolves.toEqual([
      categoryResponse,
    ]);

    expect(prismaService.category.findMany).toHaveBeenCalledWith({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('throws not found when the category does not belong to the user', async () => {
    prismaService.category.findFirst.mockResolvedValue(null);

    await expect(service.findOne(userId, category.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prismaService.category.findFirst).toHaveBeenCalledWith({
      where: {
        id: category.id,
        userId,
      },
    });
  });

  it('updates only categories owned by the authenticated user', async () => {
    prismaService.category.findFirst.mockResolvedValue(category);
    prismaService.category.update.mockResolvedValue({
      ...category,
      name: 'Transporte',
    });

    const updatedCategory = await service.update(userId, category.id, {
      name: 'Transporte',
    });

    expect(updatedCategory).toMatchObject({
      name: 'Transporte',
    });
    expect(updatedCategory).not.toHaveProperty('userId');

    expect(prismaService.category.update).toHaveBeenCalledWith({
      where: {
        id: category.id,
      },
      data: {
        name: 'Transporte',
        icon: undefined,
        color: undefined,
        type: undefined,
      },
    });
  });

  it('blocks deletion when the category has linked transactions', async () => {
    prismaService.category.findFirst.mockResolvedValue(category);
    prismaService.transaction.count.mockResolvedValue(1);

    await expect(service.remove(userId, category.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(prismaService.category.delete).not.toHaveBeenCalled();
  });

  it('deletes categories owned by the authenticated user when unused', async () => {
    prismaService.category.findFirst.mockResolvedValue(category);
    prismaService.transaction.count.mockResolvedValue(0);
    prismaService.category.delete.mockResolvedValue(category);

    await expect(service.remove(userId, category.id)).resolves.toEqual(
      categoryResponse,
    );

    expect(prismaService.category.delete).toHaveBeenCalledWith({
      where: {
        id: category.id,
      },
    });
  });
});
