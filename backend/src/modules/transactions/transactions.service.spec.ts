import { BadRequestException, NotFoundException } from '@nestjs/common';
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
import { TransactionsService } from './transactions.service';

type NestedInstallmentCreate = {
  amount: Prisma.Decimal;
  installmentNumber: number;
  totalInstallments: number;
  invoiceMonth: number;
  invoiceYear: number;
  status: InstallmentStatus;
};

type TransactionCreateArgs = {
  data: {
    userId: string;
    creditCardId: string | null;
    categoryId: string;
    description: string;
    amount: Prisma.Decimal;
    transactionType: TransactionType;
    paymentMethod: PaymentMethod;
    purchaseDate: Date;
    installmentsCount: number;
    invoiceStartMonth: number | null;
    invoiceStartYear: number | null;
    notes: string | null;
    installments?: {
      create: NestedInstallmentCreate[];
    };
  };
  include: unknown;
};

function firstMockArg<T>(mock: jest.Mock): T {
  const calls = mock.mock.calls as unknown[][];
  const firstCall = calls[0];

  if (!firstCall) {
    throw new Error('Expected mock to have been called.');
  }

  return firstCall[0] as T;
}

describe('TransactionsService', () => {
  let prismaService: {
    category: {
      findFirst: jest.Mock;
    };
    creditCard: {
      findFirst: jest.Mock;
    };
    transaction: {
      count: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let service: TransactionsService;

  const userId = '11111111-1111-4111-8111-111111111111';
  const categoryId = '22222222-2222-4222-8222-222222222222';
  const creditCardId = '33333333-3333-4333-8333-333333333333';
  const transactionId = '44444444-4444-4444-8444-444444444444';
  const purchaseDate = new Date('2026-06-23T00:00:00.000Z');
  const now = new Date('2026-06-23T12:00:00.000Z');

  const category: Category = {
    id: categoryId,
    userId,
    name: 'Mercado',
    icon: 'shopping-cart',
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
    amount: new Prisma.Decimal(100),
    transactionType: TransactionType.EXPENSE,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    purchaseDate,
    installmentsCount: 3,
    invoiceStartMonth: 11,
    invoiceStartYear: 2026,
    notes: 'Compra mensal',
    createdAt: now,
    updatedAt: now,
  };

  const installments: Installment[] = [
    {
      id: '55555555-5555-4555-8555-555555555555',
      transactionId,
      userId,
      creditCardId,
      amount: new Prisma.Decimal(33.33),
      installmentNumber: 1,
      totalInstallments: 3,
      invoiceMonth: 11,
      invoiceYear: 2026,
      status: InstallmentStatus.OPEN,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      transactionId,
      userId,
      creditCardId,
      amount: new Prisma.Decimal(33.33),
      installmentNumber: 2,
      totalInstallments: 3,
      invoiceMonth: 12,
      invoiceYear: 2026,
      status: InstallmentStatus.OPEN,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '77777777-7777-4777-8777-777777777777',
      transactionId,
      userId,
      creditCardId,
      amount: new Prisma.Decimal(33.34),
      installmentNumber: 3,
      totalInstallments: 3,
      invoiceMonth: 1,
      invoiceYear: 2027,
      status: InstallmentStatus.OPEN,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const transactionWithRelations = {
    ...transaction,
    category,
    creditCard,
    installments,
  };
  const transactionIncludeExpectation = {
    category: true,
    creditCard: true,
    installments: {
      orderBy: {
        installmentNumber: 'asc',
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
      transaction: {
        count: jest.fn(),
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

  it('creates a non-credit-card transaction without installments', async () => {
    const debitTransaction = {
      ...transaction,
      creditCardId: null,
      creditCard: null,
      paymentMethod: PaymentMethod.DEBIT,
      amount: new Prisma.Decimal(120.25),
      installmentsCount: 1,
      invoiceStartMonth: null,
      invoiceStartYear: null,
      installments: [],
      category,
    };

    prismaService.category.findFirst.mockResolvedValue({ id: categoryId });
    prismaService.transaction.create.mockResolvedValue(debitTransaction);

    await expect(
      service.create(userId, {
        categoryId,
        description: 'Debito',
        amount: 120.25,
        transactionType: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.DEBIT,
        purchaseDate,
      }),
    ).resolves.toMatchObject({
      amount: 120.25,
      creditCardId: null,
      installments: [],
    });

    expect(prismaService.creditCard.findFirst).not.toHaveBeenCalled();
    const createArgs = firstMockArg<TransactionCreateArgs>(
      prismaService.transaction.create,
    );

    expect(createArgs).toEqual({
      data: {
        userId,
        creditCardId: null,
        categoryId,
        description: 'Debito',
        amount: createArgs.data.amount,
        transactionType: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.DEBIT,
        purchaseDate,
        installmentsCount: 1,
        invoiceStartMonth: null,
        invoiceStartYear: null,
        notes: null,
        installments: undefined,
      },
      include: transactionIncludeExpectation,
    });
    expect(createArgs.data.amount).toBeInstanceOf(Prisma.Decimal);
    expect(createArgs.data.amount.toNumber()).toBe(120.25);
  });

  it('creates installments for credit-card transactions and adjusts rounding in the last installment', async () => {
    prismaService.category.findFirst.mockResolvedValue({ id: categoryId });
    prismaService.creditCard.findFirst.mockResolvedValue({ id: creditCardId });
    prismaService.transaction.create.mockResolvedValue(
      transactionWithRelations,
    );

    const result = await service.create(userId, {
      creditCardId,
      categoryId,
      description: transaction.description,
      amount: 100,
      transactionType: TransactionType.EXPENSE,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      purchaseDate,
      installmentsCount: 3,
      invoiceStartMonth: 11,
      invoiceStartYear: 2026,
      notes: transaction.notes ?? undefined,
    });

    const createArgs = firstMockArg<TransactionCreateArgs>(
      prismaService.transaction.create,
    );
    const nestedInstallments = createArgs.data.installments?.create;

    if (!nestedInstallments) {
      throw new Error('Expected credit-card transaction to create installments.');
    }

    expect(result.amount).toBe(100);
    expect(result.creditCard?.limitAmount).toBe(1500);
    expect(
      result.installments.map((installment) => installment.amount),
    ).toEqual([33.33, 33.33, 33.34]);
    expect(
      nestedInstallments.map((installment) => installment.amount.toNumber()),
    ).toEqual([33.33, 33.33, 33.34]);
    expect(
      nestedInstallments.map((installment) => ({
        month: installment.invoiceMonth,
        year: installment.invoiceYear,
      })),
    ).toEqual([
      { month: 11, year: 2026 },
      { month: 12, year: 2026 },
      { month: 1, year: 2027 },
    ]);
  });

  it('throws bad request when a credit-card transaction misses invoice data', async () => {
    prismaService.category.findFirst.mockResolvedValue({ id: categoryId });

    await expect(
      service.create(userId, {
        creditCardId,
        categoryId,
        description: transaction.description,
        amount: 100,
        transactionType: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        purchaseDate,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaService.transaction.create).not.toHaveBeenCalled();
  });

  it('throws not found when the category does not belong to the user', async () => {
    prismaService.category.findFirst.mockResolvedValue(null);

    await expect(
      service.create(userId, {
        categoryId,
        description: transaction.description,
        amount: 100,
        transactionType: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.DEBIT,
        purchaseDate,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaService.transaction.create).not.toHaveBeenCalled();
  });

  it('lists only transactions from the authenticated user with filters and relations', async () => {
    const startDate = new Date('2026-06-01T00:00:00.000Z');
    const endDate = new Date('2026-06-30T00:00:00.000Z');

    prismaService.transaction.findMany.mockResolvedValue([
      transactionWithRelations,
    ]);
    prismaService.transaction.count.mockResolvedValue(1);

    await expect(
      service.findAll(userId, {
        categoryId,
        creditCardId,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionType: TransactionType.EXPENSE,
        startDate,
        endDate,
      }),
    ).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: transactionId,
        }),
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });

    expect(prismaService.transaction.count).toHaveBeenCalledWith({
      where: {
        userId,
        categoryId,
        creditCardId,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionType: TransactionType.EXPENSE,
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
      where: {
        userId,
        categoryId,
        creditCardId,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionType: TransactionType.EXPENSE,
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: transactionIncludeExpectation,
      orderBy: [{ purchaseDate: 'desc' }, { createdAt: 'desc' }],
      skip: 0,
      take: 20,
    });
  });

  it('applies requested transaction pagination within filters', async () => {
    prismaService.transaction.findMany.mockResolvedValue([
      transactionWithRelations,
    ]);
    prismaService.transaction.count.mockResolvedValue(45);

    await expect(
      service.findAll(userId, {
        page: 3,
        limit: 10,
      }),
    ).resolves.toMatchObject({
      items: [
        {
          id: transactionId,
        },
      ],
      meta: {
        total: 45,
        page: 3,
        limit: 10,
        totalPages: 5,
      },
    });

    expect(prismaService.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it('throws not found when the transaction does not belong to the user', async () => {
    prismaService.transaction.findFirst.mockResolvedValue(null);

    await expect(service.findOne(userId, transactionId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates only simple transaction fields', async () => {
    const updatedPurchaseDate = new Date('2026-06-24T00:00:00.000Z');

    prismaService.transaction.findFirst.mockResolvedValue({
      id: transactionId,
    });
    prismaService.category.findFirst.mockResolvedValue({ id: categoryId });
    prismaService.transaction.update.mockResolvedValue({
      ...transactionWithRelations,
      description: 'Mercado atualizado',
      purchaseDate: updatedPurchaseDate,
    });

    await expect(
      service.update(userId, transactionId, {
        categoryId,
        description: 'Mercado atualizado',
        purchaseDate: updatedPurchaseDate,
        notes: 'Nova observacao',
      }),
    ).resolves.toMatchObject({
      description: 'Mercado atualizado',
      purchaseDate: updatedPurchaseDate,
    });

    expect(prismaService.transaction.update).toHaveBeenCalledWith({
      where: {
        id: transactionId,
      },
      data: {
        categoryId,
        description: 'Mercado atualizado',
        purchaseDate: updatedPurchaseDate,
        notes: 'Nova observacao',
      },
      include: transactionIncludeExpectation,
    });
  });

  it('deletes owned transactions and relies on Prisma cascade for installments', async () => {
    prismaService.transaction.findFirst.mockResolvedValue(
      transactionWithRelations,
    );
    prismaService.transaction.delete.mockResolvedValue(transaction);

    const deletedTransaction = await service.remove(userId, transactionId);

    expect(deletedTransaction.id).toBe(transactionId);
    expect(Array.isArray(deletedTransaction.installments)).toBe(true);

    expect(prismaService.transaction.delete).toHaveBeenCalledWith({
      where: {
        id: transactionId,
      },
    });
  });
});
