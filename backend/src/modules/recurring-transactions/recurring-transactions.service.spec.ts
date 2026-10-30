import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CategoryType,
  InstallmentStatus,
  PaymentMethod,
  Prisma,
  TransactionType,
  type Category,
  type CreditCard,
  type RecurringTransaction,
} from '@prisma/client';

import type { PrismaService } from '../../prisma/prisma.service';
import { RecurringTransactionsService } from './recurring-transactions.service';

describe('RecurringTransactionsService', () => {
  let prismaService: {
    category: {
      findFirst: jest.Mock;
    };
    creditCard: {
      findFirst: jest.Mock;
    };
    recurringTransaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    transaction: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      deleteMany: jest.Mock;
      count: jest.Mock;
    };
  };
  let service: RecurringTransactionsService;

  const userId = '11111111-1111-4111-8111-111111111111';
  const categoryId = '22222222-2222-4222-8222-222222222222';
  const creditCardId = '33333333-3333-4333-8333-333333333333';
  const recurringId = '44444444-4444-4444-8444-444444444444';
  const now = new Date('2026-06-01T12:00:00.000Z');

  const category: Category = {
    id: categoryId,
    userId,
    name: 'Streaming',
    icon: 'clapperboard',
    color: '#ef4444',
    type: CategoryType.EXPENSE,
    createdAt: now,
    updatedAt: now,
  };

  const creditCard: CreditCard = {
    id: creditCardId,
    userId,
    name: 'Nubank',
    lastFourDigits: '1234',
    limitAmount: new Prisma.Decimal(1500),
    closingDay: 10,
    dueDay: 17,
    color: '#8b5cf6',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const recurringTransaction: RecurringTransaction = {
    id: recurringId,
    userId,
    creditCardId,
    categoryId,
    description: 'Netflix',
    amount: new Prisma.Decimal(55.9),
    transactionType: TransactionType.EXPENSE,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    billingDay: 15,
    startDate: new Date('2026-06-15T00:00:00.000Z'),
    endDate: null,
    isActive: true,
    canceledAt: null,
    notes: 'Plano padrão',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    prismaService = {
      category: {
        findFirst: jest.fn(),
      },
      creditCard: {
        findFirst: jest.fn(),
      },
      recurringTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
    };

    service = new RecurringTransactionsService(
      prismaService as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('creates a recurring transaction and materializes 12 months of occurrences', async () => {
      prismaService.category.findFirst.mockResolvedValue(category);
      prismaService.creditCard.findFirst.mockResolvedValue(creditCard);
      prismaService.recurringTransaction.create.mockResolvedValue({
        ...recurringTransaction,
        category,
        creditCard,
      });
      prismaService.transaction.findFirst.mockResolvedValue(null);
      prismaService.transaction.create.mockResolvedValue({ id: 'tx-1' });

      const result = await service.create(userId, {
        categoryId,
        creditCardId,
        description: 'Netflix',
        amount: 55.9,
        billingDay: 15,
        startDate: new Date('2026-06-15T00:00:00.000Z'),
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionType: TransactionType.EXPENSE,
      });

      expect(result.id).toBe(recurringId);
      expect(result.amount).toBe(55.9);
      expect(prismaService.transaction.create).toHaveBeenCalledTimes(12);
    });

    it('throws BadRequestException if creditCardId is missing for credit card payment', async () => {
      prismaService.category.findFirst.mockResolvedValue(category);

      await expect(
        service.create(userId, {
          categoryId,
          description: 'Netflix',
          amount: 55.9,
          billingDay: 15,
          startDate: new Date('2026-06-15T00:00:00.000Z'),
          paymentMethod: PaymentMethod.CREDIT_CARD,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if category does not belong to user', async () => {
      prismaService.category.findFirst.mockResolvedValue(null);

      await expect(
        service.create(userId, {
          categoryId: 'non-existent',
          creditCardId,
          description: 'Netflix',
          amount: 55.9,
          billingDay: 15,
          startDate: new Date('2026-06-15T00:00:00.000Z'),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns recurring transactions for the user', async () => {
      prismaService.recurringTransaction.findMany.mockResolvedValue([
        {
          ...recurringTransaction,
          category,
          creditCard,
        },
      ]);

      const result = await service.findAll(userId, { isActive: true });

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Netflix');
      expect(prismaService.recurringTransaction.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isActive: true,
          creditCardId: undefined,
          categoryId: undefined,
        },
        include: {
          category: true,
          creditCard: true,
        },
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      });
    });
  });

  describe('findOne', () => {
    it('returns a single recurring transaction', async () => {
      prismaService.recurringTransaction.findFirst.mockResolvedValue({
        ...recurringTransaction,
        category,
        creditCard,
      });

      const result = await service.findOne(userId, recurringId);

      expect(result.id).toBe(recurringId);
      expect(result.description).toBe('Netflix');
    });

    it('throws NotFoundException if recurring transaction does not exist', async () => {
      prismaService.recurringTransaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates recurring transaction and propagates amount to open future transactions only', async () => {
      prismaService.recurringTransaction.findFirst.mockResolvedValue({
        ...recurringTransaction,
        category,
        creditCard,
      });
      prismaService.recurringTransaction.update.mockResolvedValue({
        ...recurringTransaction,
        amount: new Prisma.Decimal(69.9),
        category,
        creditCard,
      });
      prismaService.transaction.findMany.mockResolvedValue([
        {
          id: 'tx-past',
          invoiceStartMonth: 1,
          invoiceStartYear: 2020,
          installments: [{ id: 'inst-past', status: InstallmentStatus.OPEN }],
        },
        {
          id: 'tx-1',
          invoiceStartMonth: 12,
          invoiceStartYear: 2099,
          installments: [{ id: 'inst-1', status: InstallmentStatus.OPEN }],
        },
      ]);

      const result = await service.update(userId, recurringId, {
        amount: 69.9,
      });

      expect(result.amount).toBe(69.9);
      // tx-past (past) was NEVER updated despite having status OPEN
      expect(prismaService.transaction.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'tx-past' } }),
      );
      // tx-1 (future) was updated
      expect(prismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: {
          amount: new Prisma.Decimal(69.9),
          installments: {
            updateMany: {
              where: { status: InstallmentStatus.OPEN },
              data: { amount: new Prisma.Decimal(69.9) },
            },
          },
        },
      });
    });
  });

  describe('remove (Abordagem A)', () => {
    it('keeps current month and deletes only future open transactions when includeCurrentMonth is false', async () => {
      prismaService.recurringTransaction.findFirst.mockResolvedValue({
        ...recurringTransaction,
        category,
        creditCard,
      });

      // Mock transactions: one current (e.g. month: current), one future (month: future)
      const currentCycle = { month: 11, year: 2026 };
      prismaService.transaction.findMany.mockResolvedValue([
        {
          id: 'tx-current',
          invoiceStartMonth: currentCycle.month,
          invoiceStartYear: currentCycle.year,
          installments: [{ id: 'inst-c', status: InstallmentStatus.OPEN }],
        },
        {
          id: 'tx-future',
          invoiceStartMonth: 12,
          invoiceStartYear: 2026,
          installments: [{ id: 'inst-f', status: InstallmentStatus.OPEN }],
        },
      ]);
      prismaService.transaction.deleteMany.mockResolvedValue({ count: 1 });
      prismaService.transaction.count.mockResolvedValue(1); // tx-current remains
      prismaService.recurringTransaction.update.mockResolvedValue({
        ...recurringTransaction,
        isActive: false,
        canceledAt: now,
        category,
        creditCard,
      });

      await service.remove(userId, recurringId, { includeCurrentMonth: false });

      // tx-future was deleted, tx-current was preserved
      expect(prismaService.transaction.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['tx-future'] } },
      });
      // Soft cancel performed because tx-current remained
      expect(prismaService.recurringTransaction.update).toHaveBeenCalledWith({
        where: { id: recurringId },
        data: expect.objectContaining({ isActive: false }),
        include: { category: true, creditCard: true },
      });
    });

    it('deletes current month when includeCurrentMonth is true and installment is OPEN', async () => {
      const refDate = new Date();
      const currentCycle = {
        month: refDate.getUTCMonth() + 1,
        year: refDate.getUTCFullYear(),
      };

      prismaService.recurringTransaction.findFirst.mockResolvedValue({
        ...recurringTransaction,
        category,
        creditCard: null, // non-card for direct calendar cycle
      });

      prismaService.transaction.findMany.mockResolvedValue([
        {
          id: 'tx-current',
          invoiceStartMonth: currentCycle.month,
          invoiceStartYear: currentCycle.year,
          installments: [{ id: 'inst-c', status: InstallmentStatus.OPEN }],
        },
      ]);
      prismaService.transaction.deleteMany.mockResolvedValue({ count: 1 });
      prismaService.transaction.count.mockResolvedValue(0); // 0 remaining
      prismaService.recurringTransaction.delete.mockResolvedValue(
        recurringTransaction,
      );

      await service.remove(userId, recurringId, { includeCurrentMonth: true });

      expect(prismaService.transaction.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['tx-current'] } },
      });
      // Clean physical delete because 0 transactions remain
      expect(prismaService.recurringTransaction.delete).toHaveBeenCalledWith({
        where: { id: recurringId },
      });
    });

    it('throws BadRequestException if includeCurrentMonth is true but current month installment is PAID', async () => {
      const refDate = new Date();
      const currentCycle = {
        month: refDate.getUTCMonth() + 1,
        year: refDate.getUTCFullYear(),
      };

      prismaService.recurringTransaction.findFirst.mockResolvedValue({
        ...recurringTransaction,
        category,
        creditCard: null,
      });

      prismaService.transaction.findMany.mockResolvedValue([
        {
          id: 'tx-current',
          invoiceStartMonth: currentCycle.month,
          invoiceStartYear: currentCycle.year,
          installments: [{ id: 'inst-c', status: InstallmentStatus.PAID }],
        },
      ]);

      await expect(
        service.remove(userId, recurringId, { includeCurrentMonth: true }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
