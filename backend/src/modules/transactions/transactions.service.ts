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

type CreditCardResponse = Omit<CreditCard, 'limitAmount'> & {
  limitAmount: number;
};

type InstallmentResponse = Omit<Installment, 'amount'> & {
  amount: number;
};

type TransactionWithRelations = Transaction & {
  category: Category;
  creditCard: CreditCard | null;
  installments: Installment[];
};

export type TransactionResponse = Omit<Transaction, 'amount'> & {
  amount: number;
  category: Category;
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
    await this.ensureTransactionBelongsToUser(userId, id);

    if (dto.categoryId) {
      await this.ensureCategoryBelongsToUser(userId, dto.categoryId);
    }

    const transaction = await this.prismaService.transaction.update({
      where: {
        id,
      },
      data: {
        categoryId: dto.categoryId,
        description: dto.description,
        purchaseDate: dto.purchaseDate,
        notes: dto.notes,
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
      userId: transaction.userId,
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
      category: transaction.category,
      creditCard: this.mapCreditCard(transaction.creditCard),
      installments: transaction.installments.map((installment) => ({
        ...installment,
        amount: this.decimalToNumber(installment.amount),
      })),
    };
  }

  private mapCreditCard(
    creditCard: CreditCard | null,
  ): CreditCardResponse | null {
    if (!creditCard) {
      return null;
    }

    return {
      ...creditCard,
      limitAmount: this.decimalToNumber(creditCard.limitAmount),
    };
  }

  private decimalToNumber(value: Prisma.Decimal): number {
    return value.toNumber();
  }
}
