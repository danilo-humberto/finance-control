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
      count: jest.Mock;
      updateMany: jest.Mock;
    };
    transaction: {
      count: jest.Mock;
    };
    recurringTransaction: {
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
    parentId: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
  const categoryResponse = {
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type,
    parentId: null,
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
        count: jest.fn(),
        updateMany: jest.fn(),
      },
      transaction: {
        count: jest.fn(),
      },
      recurringTransaction: {
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
        parentId: null,
      },
    });
  });

  it('creates a subcategory when parent category is valid and belongs to user', async () => {
    const parentCategory: Category = {
      ...category,
      id: 'parent-id',
    };
    const subcategory: Category = {
      id: 'sub-id',
      userId,
      name: 'Supermercado',
      icon: null,
      color: null,
      type: CategoryType.EXPENSE,
      parentId: 'parent-id',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    prismaService.category.findFirst.mockResolvedValue(parentCategory);
    prismaService.category.create.mockResolvedValue(subcategory);

    const result = await service.create(userId, {
      name: 'Supermercado',
      type: CategoryType.EXPENSE,
      parentId: 'parent-id',
    });

    expect(result).toEqual({
      id: subcategory.id,
      name: subcategory.name,
      icon: null,
      color: null,
      type: CategoryType.EXPENSE,
      parentId: 'parent-id',
      createdAt: subcategory.createdAt,
      updatedAt: subcategory.updatedAt,
    });
    expect(prismaService.category.create).toHaveBeenCalledWith({
      data: {
        userId,
        name: 'Supermercado',
        icon: null,
        color: null,
        type: CategoryType.EXPENSE,
        parentId: 'parent-id',
      },
    });
  });

  it('throws NotFoundException when parent category is not found or not owned by user', async () => {
    prismaService.category.findFirst.mockResolvedValue(null);

    await expect(
      service.create(userId, {
        name: 'Supermercado',
        type: CategoryType.EXPENSE,
        parentId: 'invalid-parent-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when trying to nest under a subcategory (depth > 1)', async () => {
    const parentIsSubcategory: Category = {
      ...category,
      id: 'sub-id',
      parentId: 'root-id',
    };
    prismaService.category.findFirst.mockResolvedValue(parentIsSubcategory);

    await expect(
      service.create(userId, {
        name: 'Sub-sub',
        type: CategoryType.EXPENSE,
        parentId: 'sub-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when subcategory type differs from parent type', async () => {
    const parentCategory: Category = {
      ...category,
      id: 'parent-id',
      type: CategoryType.EXPENSE,
    };
    prismaService.category.findFirst.mockResolvedValue(parentCategory);

    await expect(
      service.create(userId, {
        name: 'Salário',
        type: CategoryType.INCOME,
        parentId: 'parent-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
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

  it('prevents a category from being set as its own parent', async () => {
    prismaService.category.findFirst.mockResolvedValue(category);

    await expect(
      service.update(userId, category.id, {
        parentId: category.id,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents a category with subcategories from becoming a subcategory', async () => {
    prismaService.category.findFirst.mockResolvedValue(category);
    prismaService.category.count.mockResolvedValue(2);

    await expect(
      service.update(userId, category.id, {
        parentId: 'another-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks deletion when the category or its subcategories have linked transactions', async () => {
    prismaService.category.findFirst.mockResolvedValue(category);
    prismaService.category.findMany.mockResolvedValue([{ id: 'sub-id' }]);
    prismaService.transaction.count.mockResolvedValue(1);

    await expect(service.remove(userId, category.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(prismaService.category.delete).not.toHaveBeenCalled();
  });

  it('blocks deletion when the category or its subcategories are used in recurring transactions', async () => {
    prismaService.category.findFirst.mockResolvedValue(category);
    prismaService.category.findMany.mockResolvedValue([]);
    prismaService.transaction.count.mockResolvedValue(0);
    prismaService.recurringTransaction.count.mockResolvedValue(1);

    await expect(service.remove(userId, category.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(prismaService.category.delete).not.toHaveBeenCalled();
  });

  it('deletes categories owned by the authenticated user when unused', async () => {
    prismaService.category.findFirst.mockResolvedValue(category);
    prismaService.category.findMany.mockResolvedValue([]);
    prismaService.transaction.count.mockResolvedValue(0);
    prismaService.recurringTransaction.count.mockResolvedValue(0);
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
