import { NotFoundException } from '@nestjs/common';
import {
  CategoryType,
  InstallmentStatus,
  PaymentMethod,
  Prisma,
  TransactionType,
  type Category,
  type CreditCard,
  type Installment,
  type Transaction,
} from '@prisma/client';

import type { PrismaService } from '../../prisma/prisma.service';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let prismaService: {
    category: {
      findFirst: jest.Mock;
    };
    creditCard: {
      findFirst: jest.Mock;
    };
    installment: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let service: InvoicesService;

  const userId = '11111111-1111-4111-8111-111111111111';
  const categoryId = '22222222-2222-4222-8222-222222222222';
  const creditCardId = '33333333-3333-4333-8333-333333333333';
  const transactionId = '44444444-4444-4444-8444-444444444444';
  const installmentId = '55555555-5555-4555-8555-555555555555';
  const purchaseDate = new Date('2026-06-23T00:00:00.000Z');
  const now = new Date('2026-06-23T12:00:00.000Z');

  const category: Category = {
    id: categoryId,
    userId,
    name: 'Alimentacao',
    icon: 'utensils',
    color: '#22c55e',
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

  const transaction: Transaction = {
    id: transactionId,
    userId,
    creditCardId,
    categoryId,
    description: 'Mercado',
    amount: new Prisma.Decimal(300),
    transactionType: TransactionType.EXPENSE,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    purchaseDate,
    installmentsCount: 3,
    invoiceStartMonth: 7,
    invoiceStartYear: 2026,
    notes: null,
    createdAt: now,
    updatedAt: now,
  };

  const installment: Installment = {
    id: installmentId,
    transactionId,
    userId,
    creditCardId,
    amount: new Prisma.Decimal(100),
    installmentNumber: 1,
    totalInstallments: 3,
    invoiceMonth: 7,
    invoiceYear: 2026,
    status: InstallmentStatus.OPEN,
    createdAt: now,
    updatedAt: now,
  };

  const installmentWithRelations = {
    ...installment,
    creditCard,
    transaction: {
      ...transaction,
      category,
      creditCard,
    },
  };
  const installmentIncludeExpectation = {
    creditCard: true,
    transaction: {
      include: {
        category: true,
        creditCard: true,
      },
    },
  };

  beforeEach(() => {
    prismaService = {
      category: {
        findFirst: jest.fn(),
      },
      creditCard: {
        findFirst: jest.fn(),
      },
      installment: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new InvoicesService(prismaService as unknown as PrismaService);
  });

  it('returns open invoice installments with filters and calculated total', async () => {
    prismaService.creditCard.findFirst.mockResolvedValue({ id: creditCardId });
    prismaService.category.findFirst.mockResolvedValue({ id: categoryId });
    prismaService.installment.findMany.mockResolvedValue([
      installmentWithRelations,
      {
        ...installmentWithRelations,
        id: '66666666-6666-4666-8666-666666666666',
        amount: new Prisma.Decimal(50.55),
        installmentNumber: 2,
      },
    ]);

    await expect(
      service.findOne(userId, {
        month: 7,
        year: 2026,
        creditCardId,
        categoryId,
      }),
    ).resolves.toEqual({
      month: 7,
      year: 2026,
      total: 150.55,
      filters: {
        creditCardId,
        categoryId,
      },
      items: [
        {
          id: installmentId,
          description: 'Mercado',
          amount: 100,
          installmentNumber: 1,
          totalInstallments: 3,
          status: InstallmentStatus.OPEN,
          category: {
            id: categoryId,
            name: 'Alimentacao',
            color: '#22c55e',
            icon: 'utensils',
          },
          creditCard: {
            id: creditCardId,
            name: 'Nubank',
            color: '#8b5cf6',
          },
          transaction: {
            id: transactionId,
            purchaseDate,
          },
        },
        {
          id: '66666666-6666-4666-8666-666666666666',
          description: 'Mercado',
          amount: 50.55,
          installmentNumber: 2,
          totalInstallments: 3,
          status: InstallmentStatus.OPEN,
          category: {
            id: categoryId,
            name: 'Alimentacao',
            color: '#22c55e',
            icon: 'utensils',
          },
          creditCard: {
            id: creditCardId,
            name: 'Nubank',
            color: '#8b5cf6',
          },
          transaction: {
            id: transactionId,
            purchaseDate,
          },
        },
      ],
    });

    expect(prismaService.installment.findMany).toHaveBeenCalledWith({
      where: {
        userId,
        invoiceMonth: 7,
        invoiceYear: 2026,
        status: InstallmentStatus.OPEN,
        creditCardId,
        transaction: {
          categoryId,
        },
      },
      include: installmentIncludeExpectation,
      orderBy: [{ createdAt: 'asc' }, { installmentNumber: 'asc' }],
    });
  });

  it('throws not found when a credit-card filter does not belong to the user', async () => {
    prismaService.creditCard.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne(userId, {
        month: 7,
        year: 2026,
        creditCardId,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaService.installment.findMany).not.toHaveBeenCalled();
  });

  it('throws not found when a category filter does not belong to the user', async () => {
    prismaService.category.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne(userId, {
        month: 7,
        year: 2026,
        categoryId,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaService.installment.findMany).not.toHaveBeenCalled();
  });

  it('marks an owned installment as paid', async () => {
    prismaService.installment.findFirst.mockResolvedValue({
      id: installmentId,
    });
    prismaService.installment.update.mockResolvedValue({
      ...installmentWithRelations,
      status: InstallmentStatus.PAID,
    });

    await expect(
      service.payInstallment(userId, installmentId),
    ).resolves.toEqual(
      expect.objectContaining({
        id: installmentId,
        status: InstallmentStatus.PAID,
      }),
    );

    expect(prismaService.installment.update).toHaveBeenCalledWith({
      where: {
        id: installmentId,
      },
      data: {
        status: InstallmentStatus.PAID,
      },
      include: installmentIncludeExpectation,
    });
  });

  it('reopens an owned installment', async () => {
    prismaService.installment.findFirst.mockResolvedValue({
      id: installmentId,
    });
    prismaService.installment.update.mockResolvedValue(
      installmentWithRelations,
    );

    await expect(
      service.reopenInstallment(userId, installmentId),
    ).resolves.toEqual(
      expect.objectContaining({
        id: installmentId,
        status: InstallmentStatus.OPEN,
      }),
    );

    expect(prismaService.installment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          status: InstallmentStatus.OPEN,
        },
      }),
    );
  });

  it('cancels an owned installment', async () => {
    prismaService.installment.findFirst.mockResolvedValue({
      id: installmentId,
    });
    prismaService.installment.update.mockResolvedValue({
      ...installmentWithRelations,
      status: InstallmentStatus.CANCELED,
    });

    await expect(
      service.cancelInstallment(userId, installmentId),
    ).resolves.toEqual(
      expect.objectContaining({
        id: installmentId,
        status: InstallmentStatus.CANCELED,
      }),
    );

    expect(prismaService.installment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          status: InstallmentStatus.CANCELED,
        },
      }),
    );
  });

  it('blocks status changes for installments from another user', async () => {
    prismaService.installment.findFirst.mockResolvedValue(null);

    await expect(
      service.payInstallment(userId, installmentId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaService.installment.update).not.toHaveBeenCalled();
  });
});
