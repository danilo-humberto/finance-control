import { NotFoundException } from '@nestjs/common';
import {
  PaymentMethod,
  Prisma,
  TransactionType,
  type Transaction,
} from '@prisma/client';

import type { PrismaService } from '../../prisma/prisma.service';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let prismaService: {
    category: {
      findFirst: jest.Mock;
    };
    creditCard: {
      findFirst: jest.Mock;
    };
    transaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let service: TransactionsService;

  const userId = 'user-id';
  const transaction: Transaction = {
    id: 'transaction-id',
    userId,
    creditCardId: 'credit-card-id',
    categoryId: 'category-id',
    description: 'Compra simples',
    amount: new Prisma.Decimal(100),
    transactionType: TransactionType.EXPENSE,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    purchaseDate: new Date('2026-01-01T00:00:00.000Z'),
    installmentsCount: 1,
    invoiceStartMonth: null,
    invoiceStartYear: null,
    notes: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    prismaService = {
      category: {
        findFirst: jest.fn(),
      },
      creditCard: {
        findFirst: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new TransactionsService(
      prismaService as unknown as PrismaService,
    );
  });

  it('creates a transaction for the authenticated user without generating installments', async () => {
    prismaService.category.findFirst.mockResolvedValue({
      id: transaction.categoryId,
    });
    prismaService.creditCard.findFirst.mockResolvedValue({
      id: transaction.creditCardId,
    });
    prismaService.transaction.create.mockResolvedValue(transaction);

    await expect(
      service.create(userId, {
        creditCardId: transaction.creditCardId ?? undefined,
        categoryId: transaction.categoryId,
        description: transaction.description,
        amount: 100,
        transactionType: transaction.transactionType,
        paymentMethod: transaction.paymentMethod,
        purchaseDate: transaction.purchaseDate,
      }),
    ).resolves.toEqual(transaction);

    expect(prismaService.category.findFirst).toHaveBeenCalledWith({
      where: {
        id: transaction.categoryId,
        userId,
      },
    });
    expect(prismaService.creditCard.findFirst).toHaveBeenCalledWith({
      where: {
        id: transaction.creditCardId,
        userId,
      },
    });
    expect(prismaService.transaction.create).toHaveBeenCalledWith({
      data: {
        userId,
        creditCardId: transaction.creditCardId,
        categoryId: transaction.categoryId,
        description: transaction.description,
        amount: 100,
        transactionType: transaction.transactionType,
        paymentMethod: transaction.paymentMethod,
        purchaseDate: transaction.purchaseDate,
        installmentsCount: 1,
        invoiceStartMonth: null,
        invoiceStartYear: null,
        notes: null,
      },
    });
  });

  it('throws not found when the category does not belong to the user', async () => {
    prismaService.category.findFirst.mockResolvedValue(null);

    await expect(
      service.create(userId, {
        categoryId: transaction.categoryId,
        description: transaction.description,
        amount: 100,
        transactionType: transaction.transactionType,
        paymentMethod: transaction.paymentMethod,
        purchaseDate: transaction.purchaseDate,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaService.transaction.create).not.toHaveBeenCalled();
  });

  it('lists only transactions from the authenticated user', async () => {
    prismaService.transaction.findMany.mockResolvedValue([transaction]);

    await expect(service.findAll(userId)).resolves.toEqual([transaction]);

    expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });
});
