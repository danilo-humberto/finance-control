import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InstallmentStatus,
  PaymentMethod,
  Prisma,
  type Category,
  type CreditCard,
  type Installment,
  type Transaction,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

type CategoryResponse = Omit<Category, 'userId'>;

type CreditCardResponse = Omit<CreditCard, 'limitAmount' | 'userId'> & {
  limitAmount: number;
};

type InstallmentResponse = Omit<Installment, 'amount' | 'userId'> & {
  amount: number;
};

type TransactionWithRelations = Transaction & {
  category: Category;
  creditCard: CreditCard | null;
  installments: Installment[];
};

export type TransactionResponse = Omit<Transaction, 'amount' | 'userId'> & {
  amount: number;
  category: CategoryResponse;
  creditCard: CreditCardResponse | null;
  installments: InstallmentResponse[];
};

export type PaginatedTransactionsResponse = {
  items: TransactionResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

@Injectable()
export class TransactionsService {
  private readonly transactionInclude = {
    category: true,
    creditCard: true,
    installments: {
      orderBy: {
        installmentNumber: 'asc',
      },
    },
  } satisfies Prisma.TransactionInclude;

  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    await this.ensureCategoryBelongsToUser(userId, dto.categoryId);

    const amount = this.toMoneyDecimal(dto.amount);
    const isCreditCard = dto.paymentMethod === PaymentMethod.CREDIT_CARD;
    const installmentsCount = isCreditCard ? (dto.installmentsCount ?? 1) : 1;
    let creditCardId: string | null = null;
    let invoiceStartMonth: number | null = null;
    let invoiceStartYear: number | null = null;

    if (isCreditCard) {
      if (
        !dto.creditCardId ||
        dto.invoiceStartMonth === undefined ||
        dto.invoiceStartYear === undefined
      ) {
        throw new BadRequestException(
          'Credit card transactions require creditCardId, invoiceStartMonth and invoiceStartYear.',
        );
      }

      await this.ensureCreditCardBelongsToUser(userId, dto.creditCardId);
      creditCardId = dto.creditCardId;
      invoiceStartMonth = dto.invoiceStartMonth;
      invoiceStartYear = dto.invoiceStartYear;
    }

    const transaction = await this.prismaService.transaction.create({
      data: {
        userId,
        creditCardId,
        categoryId: dto.categoryId,
        description: dto.description,
        amount,
        transactionType: dto.transactionType,
        paymentMethod: dto.paymentMethod,
        purchaseDate: dto.purchaseDate,
        installmentsCount,
        invoiceStartMonth,
        invoiceStartYear,
        notes: dto.notes ?? null,
        installments:
          isCreditCard &&
          creditCardId !== null &&
          invoiceStartMonth !== null &&
          invoiceStartYear !== null
            ? {
                create: this.buildInstallments({
                  userId,
                  creditCardId,
                  amount,
                  installmentsCount,
                  invoiceStartMonth,
                  invoiceStartYear,
                }),
              }
            : undefined,
      },
      include: this.transactionInclude,
    });

    return this.mapTransaction(transaction);
  }

  async findAll(
    userId: string,
    query: QueryTransactionsDto,
  ): Promise<PaginatedTransactionsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.TransactionWhereInput = {
      userId,
      categoryId: query.categoryId,
      creditCardId: query.creditCardId,
      paymentMethod: query.paymentMethod,
      transactionType: query.transactionType,
    };

    if (query.startDate || query.endDate) {
      where.purchaseDate = {
        gte: query.startDate,
        lte: query.endDate,
      };
    }

    const [total, transactions] = await Promise.all([
      this.prismaService.transaction.count({
        where: {
          ...where,
        },
      }),
      this.prismaService.transaction.findMany({
        where: {
          ...where,
        },
        include: this.transactionInclude,
        orderBy: [{ purchaseDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      items: transactions.map((transaction) => this.mapTransaction(transaction)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string): Promise<TransactionResponse> {
    const transaction = await this.findOwnedTransaction(userId, id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    return this.mapTransaction(transaction);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionResponse> {
    const existingTransaction = await this.findOwnedTransaction(userId, id);

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found.');
    }

    if (dto.categoryId) {
      await this.ensureCategoryBelongsToUser(userId, dto.categoryId);
    }

    const amount =
      dto.amount !== undefined
        ? this.toMoneyDecimal(dto.amount)
        : existingTransaction.amount;
    const paymentMethod =
      dto.paymentMethod ?? existingTransaction.paymentMethod;
    const isCreditCard = paymentMethod === PaymentMethod.CREDIT_CARD;
    const installmentsCount = isCreditCard
      ? (dto.installmentsCount ?? existingTransaction.installmentsCount ?? 1)
      : 1;
    let creditCardId: string | null = null;
    let invoiceStartMonth: number | null = null;
    let invoiceStartYear: number | null = null;

    if (isCreditCard) {
      creditCardId = dto.creditCardId ?? existingTransaction.creditCardId;
      invoiceStartMonth =
        dto.invoiceStartMonth ?? existingTransaction.invoiceStartMonth;
      invoiceStartYear =
        dto.invoiceStartYear ?? existingTransaction.invoiceStartYear;

      if (
        !creditCardId ||
        invoiceStartMonth === null ||
        invoiceStartYear === null
      ) {
        throw new BadRequestException(
          'Credit card transactions require creditCardId, invoiceStartMonth and invoiceStartYear.',
        );
      }

      if (
        dto.creditCardId !== undefined ||
        creditCardId !== existingTransaction.creditCardId
      ) {
        await this.ensureCreditCardBelongsToUser(userId, creditCardId);
      }
    }

    const shouldRebuildInstallments = this.shouldRebuildInstallments(
      existingTransaction,
      {
        amount,
        creditCardId,
        installmentsCount,
        invoiceStartMonth,
        invoiceStartYear,
        paymentMethod,
      },
    );

    if (
      shouldRebuildInstallments &&
      existingTransaction.installments.some(
        (installment) => installment.status !== InstallmentStatus.OPEN,
      )
    ) {
      throw new BadRequestException(
        'Transaction installments with paid or canceled status cannot be recalculated.',
      );
    }

    const transaction = await this.prismaService.transaction.update({
      where: {
        id,
      },
      data: {
        creditCardId,
        categoryId: dto.categoryId ?? existingTransaction.categoryId,
        description: dto.description,
        amount,
        transactionType: dto.transactionType,
        paymentMethod,
        purchaseDate: dto.purchaseDate,
        installmentsCount,
        invoiceStartMonth,
        invoiceStartYear,
        notes: dto.notes,
        installments: shouldRebuildInstallments
          ? isCreditCard &&
            creditCardId !== null &&
            invoiceStartMonth !== null &&
            invoiceStartYear !== null
            ? {
                deleteMany: {},
                create: this.buildInstallments({
                  userId,
                  creditCardId,
                  amount,
                  installmentsCount,
                  invoiceStartMonth,
                  invoiceStartYear,
                }),
              }
            : {
                deleteMany: {},
              }
          : undefined,
      },
      include: this.transactionInclude,
    });

    return this.mapTransaction(transaction);
  }

  async remove(userId: string, id: string): Promise<TransactionResponse> {
    const transaction = await this.findOwnedTransaction(userId, id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    await this.prismaService.transaction.delete({
      where: {
        id,
      },
    });

    return this.mapTransaction(transaction);
  }

  private findOwnedTransaction(
    userId: string,
    id: string,
  ): Promise<TransactionWithRelations | null> {
    return this.prismaService.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: this.transactionInclude,
    });
  }

  private async ensureTransactionBelongsToUser(
    userId: string,
    id: string,
  ): Promise<void> {
    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }
  }

  private async ensureCategoryBelongsToUser(
    userId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }
  }

  private async ensureCreditCardBelongsToUser(
    userId: string,
    creditCardId: string,
  ): Promise<void> {
    const creditCard = await this.prismaService.creditCard.findFirst({
      where: {
        id: creditCardId,
        userId,
      },
    });

    if (!creditCard) {
      throw new NotFoundException('Credit card not found.');
    }
  }

  private shouldRebuildInstallments(
    transaction: TransactionWithRelations,
    params: {
      amount: Prisma.Decimal;
      creditCardId: string | null;
      installmentsCount: number;
      invoiceStartMonth: number | null;
      invoiceStartYear: number | null;
      paymentMethod: PaymentMethod;
    },
  ): boolean {
    return (
      transaction.paymentMethod !== params.paymentMethod ||
      !transaction.amount.equals(params.amount) ||
      transaction.creditCardId !== params.creditCardId ||
      transaction.installmentsCount !== params.installmentsCount ||
      transaction.invoiceStartMonth !== params.invoiceStartMonth ||
      transaction.invoiceStartYear !== params.invoiceStartYear
    );
  }

  private buildInstallments(params: {
    userId: string;
    creditCardId: string;
    amount: Prisma.Decimal;
    installmentsCount: number;
    invoiceStartMonth: number;
    invoiceStartYear: number;
  }): Prisma.InstallmentCreateWithoutTransactionInput[] {
    const totalCents = params.amount.mul(100).toNumber();
    const baseCents = Math.trunc(totalCents / params.installmentsCount);
    const remainingCents = totalCents - baseCents * params.installmentsCount;

    return Array.from({ length: params.installmentsCount }, (_, index) => {
      const installmentCents =
        index === params.installmentsCount - 1
          ? baseCents + remainingCents
          : baseCents;
      const invoiceDate = this.calculateInvoiceDate(
        params.invoiceStartMonth,
        params.invoiceStartYear,
        index,
      );

      return {
        user: {
          connect: {
            id: params.userId,
          },
        },
        creditCard: {
          connect: {
            id: params.creditCardId,
          },
        },
        amount: new Prisma.Decimal(installmentCents).div(100),
        installmentNumber: index + 1,
        totalInstallments: params.installmentsCount,
        invoiceMonth: invoiceDate.month,
        invoiceYear: invoiceDate.year,
        status: InstallmentStatus.OPEN,
      };
    });
  }

  private calculateInvoiceDate(
    startMonth: number,
    startYear: number,
    installmentIndex: number,
  ): { month: number; year: number } {
    const zeroBasedMonth = startMonth - 1 + installmentIndex;

    return {
      month: (zeroBasedMonth % 12) + 1,
      year: startYear + Math.floor(zeroBasedMonth / 12),
    };
  }

  private toMoneyDecimal(value: number): Prisma.Decimal {
    return new Prisma.Decimal(value).toDecimalPlaces(
      2,
      Prisma.Decimal.ROUND_HALF_UP,
    );
  }

  private mapTransaction(
    transaction: TransactionWithRelations,
  ): TransactionResponse {
    return {
      id: transaction.id,
      creditCardId: transaction.creditCardId,
      categoryId: transaction.categoryId,
      description: transaction.description,
      amount: this.decimalToNumber(transaction.amount),
      transactionType: transaction.transactionType,
      paymentMethod: transaction.paymentMethod,
      purchaseDate: transaction.purchaseDate,
      installmentsCount: transaction.installmentsCount,
      invoiceStartMonth: transaction.invoiceStartMonth,
      invoiceStartYear: transaction.invoiceStartYear,
      notes: transaction.notes,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      category: this.mapCategory(transaction.category),
      creditCard: this.mapCreditCard(transaction.creditCard),
      installments: transaction.installments.map((installment) =>
        this.mapInstallment(installment),
      ),
    };
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

  private mapCreditCard(
    creditCard: CreditCard | null,
  ): CreditCardResponse | null {
    if (!creditCard) {
      return null;
    }

    return {
      id: creditCard.id,
      name: creditCard.name,
      lastFourDigits: creditCard.lastFourDigits,
      limitAmount: this.decimalToNumber(creditCard.limitAmount),
      closingDay: creditCard.closingDay,
      dueDay: creditCard.dueDay,
      color: creditCard.color,
      isActive: creditCard.isActive,
      createdAt: creditCard.createdAt,
      updatedAt: creditCard.updatedAt,
    };
  }

  private mapInstallment(installment: Installment): InstallmentResponse {
    return {
      id: installment.id,
      transactionId: installment.transactionId,
      creditCardId: installment.creditCardId,
      amount: this.decimalToNumber(installment.amount),
      installmentNumber: installment.installmentNumber,
      totalInstallments: installment.totalInstallments,
      invoiceMonth: installment.invoiceMonth,
      invoiceYear: installment.invoiceYear,
      status: installment.status,
      createdAt: installment.createdAt,
      updatedAt: installment.updatedAt,
    };
  }

  private decimalToNumber(value: Prisma.Decimal): number {
    return value.toNumber();
  }
}
