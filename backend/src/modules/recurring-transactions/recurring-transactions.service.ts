import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoryType,
  InstallmentStatus,
  PaymentMethod,
  Prisma,
  TransactionType,
  type Category,
  type CreditCard,
  type RecurringTransaction,
  type Transaction,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { DeleteRecurringTransactionDto } from './dto/delete-recurring-transaction.dto';
import { QueryRecurringTransactionsDto } from './dto/query-recurring-transactions.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

type CategoryResponse = Omit<Category, 'userId'>;

type CreditCardResponse = Omit<CreditCard, 'limitAmount' | 'userId'> & {
  limitAmount: number;
};

type RecurringTransactionWithRelations = RecurringTransaction & {
  category: Category;
  creditCard: CreditCard | null;
  transactions?: Transaction[];
};

export type RecurringTransactionResponse = Omit<
  RecurringTransaction,
  'amount' | 'userId'
> & {
  amount: number;
  category: CategoryResponse;
  creditCard: CreditCardResponse | null;
};

@Injectable()
export class RecurringTransactionsService {
  private readonly recurringInclude = {
    category: true,
    creditCard: true,
  } satisfies Prisma.RecurringTransactionInclude;

  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    dto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponse> {
    await this.ensureCategoryBelongsToUser(userId, dto.categoryId);

    const amount = this.toMoneyDecimal(dto.amount);
    const isCreditCard = dto.paymentMethod === PaymentMethod.CREDIT_CARD;
    let creditCardId: string | null = null;
    let creditCard: CreditCard | null = null;

    if (isCreditCard) {
      if (!dto.creditCardId) {
        throw new BadRequestException(
          'Credit card recurring transactions require creditCardId.',
        );
      }
      creditCard = await this.ensureCreditCardBelongsToUser(
        userId,
        dto.creditCardId,
      );
      creditCardId = creditCard.id;
    }

    const recurring = await this.prismaService.recurringTransaction.create({
      data: {
        userId,
        creditCardId,
        categoryId: dto.categoryId,
        description: dto.description,
        amount,
        transactionType: dto.transactionType ?? TransactionType.EXPENSE,
        paymentMethod: dto.paymentMethod ?? PaymentMethod.CREDIT_CARD,
        billingDay: dto.billingDay,
        startDate: dto.startDate,
        endDate: dto.endDate ?? null,
        notes: dto.notes ?? null,
      },
      include: this.recurringInclude,
    });

    await this.materializeOccurrences(recurring, creditCard, 12);

    return this.mapRecurringTransaction(recurring);
  }

  async findAll(
    userId: string,
    query: QueryRecurringTransactionsDto,
  ): Promise<RecurringTransactionResponse[]> {
    const where: Prisma.RecurringTransactionWhereInput = {
      userId,
      isActive: query.isActive,
      creditCardId: query.creditCardId,
      categoryId: query.categoryId,
    };

    const items = await this.prismaService.recurringTransaction.findMany({
      where,
      include: this.recurringInclude,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    return items.map((item) => this.mapRecurringTransaction(item));
  }

  async findOne(
    userId: string,
    id: string,
  ): Promise<RecurringTransactionResponse> {
    const recurring = await this.findOwnedRecurringTransaction(userId, id);

    if (!recurring) {
      throw new NotFoundException('Recurring transaction not found.');
    }

    return this.mapRecurringTransaction(recurring);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateRecurringTransactionDto,
  ): Promise<RecurringTransactionResponse> {
    const existing = await this.findOwnedRecurringTransaction(userId, id);

    if (!existing) {
      throw new NotFoundException('Recurring transaction not found.');
    }

    if (dto.categoryId) {
      await this.ensureCategoryBelongsToUser(userId, dto.categoryId);
    }

    const amount =
      dto.amount !== undefined ? this.toMoneyDecimal(dto.amount) : existing.amount;
    const paymentMethod = dto.paymentMethod ?? existing.paymentMethod;
    const isCreditCard = paymentMethod === PaymentMethod.CREDIT_CARD;
    let creditCardId = existing.creditCardId;

    if (isCreditCard && dto.creditCardId !== undefined) {
      if (!dto.creditCardId) {
        throw new BadRequestException(
          'Credit card recurring transactions require creditCardId.',
        );
      }
      await this.ensureCreditCardBelongsToUser(userId, dto.creditCardId);
      creditCardId = dto.creditCardId;
    }

    const updated = await this.prismaService.recurringTransaction.update({
      where: { id },
      data: {
        creditCardId,
        categoryId: dto.categoryId ?? existing.categoryId,
        description: dto.description ?? existing.description,
        amount,
        transactionType: dto.transactionType ?? existing.transactionType,
        paymentMethod,
        billingDay: dto.billingDay ?? existing.billingDay,
        startDate: dto.startDate ?? existing.startDate,
        endDate: dto.endDate !== undefined ? dto.endDate : existing.endDate,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
        notes: dto.notes !== undefined ? dto.notes : existing.notes,
      },
      include: this.recurringInclude,
    });

    // Propagate updates to future open transactions (congelando meses passados)
    await this.propagateUpdatesToOpenTransactions(existing, {
      amount: dto.amount !== undefined ? amount : undefined,
      description: dto.description,
      categoryId: dto.categoryId,
    });

    return this.mapRecurringTransaction(updated);
  }

  async remove(
    userId: string,
    id: string,
    query: DeleteRecurringTransactionDto,
  ): Promise<RecurringTransactionResponse> {
    const recurring = await this.findOwnedRecurringTransaction(userId, id);

    if (!recurring) {
      throw new NotFoundException('Recurring transaction not found.');
    }

    const includeCurrentMonth = Boolean(query.includeCurrentMonth);
    const now = new Date();
    const currentMonthYear = this.getCurrentCycleMonthYear(recurring.creditCard, now);

    const relatedTransactions = await this.prismaService.transaction.findMany({
      where: {
        recurringTransactionId: id,
        userId,
      },
      include: {
        installments: true,
      },
    });

    const idsToDelete: string[] = [];

    for (const transaction of relatedTransactions) {
      const txMonth = transaction.invoiceStartMonth;
      const txYear = transaction.invoiceStartYear;

      if (!txMonth || !txYear) {
        continue;
      }

      const isPast =
        txYear < currentMonthYear.year ||
        (txYear === currentMonthYear.year && txMonth < currentMonthYear.month);

      const isCurrent =
        txYear === currentMonthYear.year && txMonth === currentMonthYear.month;

      const hasPaidInstallment = transaction.installments.some(
        (inst) => inst.status === InstallmentStatus.PAID,
      );

      if (isPast) {
        // Blindagem temporal: Always preserve past transactions, regardless of status
        continue;
      }

      if (isCurrent) {
        if (includeCurrentMonth) {
          if (hasPaidInstallment) {
            throw new BadRequestException(
              'A parcela da fatura atual já foi paga e não pode ser excluída.',
            );
          }
          idsToDelete.push(transaction.id);
        }
        continue;
      }

      // Future transactions: delete if not paid
      if (!hasPaidInstallment) {
        idsToDelete.push(transaction.id);
      }
    }

    if (idsToDelete.length > 0) {
      await this.prismaService.transaction.deleteMany({
        where: {
          id: {
            in: idsToDelete,
          },
        },
      });
    }

    const remainingCount = await this.prismaService.transaction.count({
      where: {
        recurringTransactionId: id,
      },
    });

    let result = recurring;

    if (remainingCount === 0) {
      // No remaining transactions: clean physical deletion
      await this.prismaService.recurringTransaction.delete({
        where: { id },
      });
    } else {
      // Historical transactions remain: soft cancel to preserve history
      result = await this.prismaService.recurringTransaction.update({
        where: { id },
        data: {
          isActive: false,
          canceledAt: new Date(),
        },
        include: this.recurringInclude,
      });
    }

    return this.mapRecurringTransaction(result);
  }

  private async materializeOccurrences(
    recurring: RecurringTransactionWithRelations,
    creditCard: CreditCard | null,
    monthsAhead: number,
  ): Promise<void> {
    const isCreditCard = recurring.paymentMethod === PaymentMethod.CREDIT_CARD;
    const start = new Date(recurring.startDate);
    const startYear = start.getUTCFullYear();
    const startMonth = start.getUTCMonth() + 1; // 1-12

    for (let i = 0; i < monthsAhead; i++) {
      const zeroBasedMonth = startMonth - 1 + i;
      const targetMonth = (zeroBasedMonth % 12) + 1;
      const targetYear = startYear + Math.floor(zeroBasedMonth / 12);
      const clampedDay = this.clampDayToMonth(
        recurring.billingDay,
        targetMonth,
        targetYear,
      );
      const purchaseDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, clampedDay),
      );

      if (recurring.endDate && purchaseDate > new Date(recurring.endDate)) {
        break;
      }

      let invoiceMonth = targetMonth;
      let invoiceYear = targetYear;

      if (isCreditCard && creditCard) {
        const cycle = this.calculateInvoiceCycle(
          purchaseDate,
          creditCard.closingDay,
          creditCard.dueDay,
        );
        invoiceMonth = cycle.month;
        invoiceYear = cycle.year;
      }

      // Check idempotency: avoid duplicate creation
      const existing = await this.prismaService.transaction.findFirst({
        where: {
          recurringTransactionId: recurring.id,
          invoiceStartYear: invoiceYear,
          invoiceStartMonth: invoiceMonth,
        },
        select: { id: true },
      });

      if (existing) {
        continue;
      }

      await this.prismaService.transaction.create({
        data: {
          userId: recurring.userId,
          creditCardId: recurring.creditCardId,
          categoryId: recurring.categoryId,
          recurringTransactionId: recurring.id,
          description: recurring.description,
          amount: recurring.amount,
          transactionType: recurring.transactionType,
          paymentMethod: recurring.paymentMethod,
          purchaseDate,
          installmentsCount: 1,
          invoiceStartMonth: invoiceMonth,
          invoiceStartYear: invoiceYear,
          notes: recurring.notes,
          installments:
            isCreditCard && recurring.creditCardId
              ? {
                  create: [
                    {
                      userId: recurring.userId,
                      creditCardId: recurring.creditCardId,
                      amount: recurring.amount,
                      installmentNumber: 1,
                      totalInstallments: 1,
                      invoiceMonth,
                      invoiceYear,
                      status: InstallmentStatus.OPEN,
                    },
                  ],
                }
              : undefined,
        },
      });
    }
  }

  private async propagateUpdatesToOpenTransactions(
    recurring: RecurringTransactionWithRelations,
    updates: {
      amount?: Prisma.Decimal;
      description?: string;
      categoryId?: string;
    },
  ): Promise<void> {
    const now = new Date();
    const currentCycle = this.getCurrentCycleMonthYear(recurring.creditCard, now);

    const transactions = await this.prismaService.transaction.findMany({
      where: {
        recurringTransactionId: recurring.id,
      },
      include: {
        installments: true,
      },
    });

    for (const transaction of transactions) {
      const txMonth = transaction.invoiceStartMonth;
      const txYear = transaction.invoiceStartYear;

      if (!txMonth || !txYear) {
        continue;
      }

      const isPast =
        txYear < currentCycle.year ||
        (txYear === currentCycle.year && txMonth < currentCycle.month);

      if (isPast) {
        // Blindagem temporal: JAMAIS alterar meses anteriores, mesmo que status seja OPEN!
        continue;
      }

      const allOpen = transaction.installments.every(
        (inst) => inst.status === InstallmentStatus.OPEN,
      );

      if (!allOpen) {
        continue;
      }

      const dataToUpdate: Prisma.TransactionUpdateInput = {};

      if (updates.description) {
        dataToUpdate.description = updates.description;
      }

      if (updates.categoryId) {
        dataToUpdate.category = {
          connect: { id: updates.categoryId },
        };
      }

      if (updates.amount) {
        dataToUpdate.amount = updates.amount;
        dataToUpdate.installments = {
          updateMany: {
            where: {
              status: InstallmentStatus.OPEN,
            },
            data: {
              amount: updates.amount,
            },
          },
        };
      }

      if (Object.keys(dataToUpdate).length > 0) {
        await this.prismaService.transaction.update({
          where: { id: transaction.id },
          data: dataToUpdate,
        });
      }
    }
  }

  private getCurrentCycleMonthYear(
    creditCard: CreditCard | null,
    referenceDate: Date,
  ): { month: number; year: number } {
    if (!creditCard) {
      return {
        month: referenceDate.getUTCMonth() + 1,
        year: referenceDate.getUTCFullYear(),
      };
    }

    return this.calculateInvoiceCycle(
      referenceDate,
      creditCard.closingDay,
      creditCard.dueDay,
    );
  }

  private calculateInvoiceCycle(
    purchaseDate: Date,
    closingDay: number,
    dueDay: number,
  ): { month: number; year: number } {
    const purchaseMonth = purchaseDate.getUTCMonth() + 1;
    const purchaseYear = purchaseDate.getUTCFullYear();
    const purchaseDay = purchaseDate.getUTCDate();
    const lastDayOfMonth = this.getLastDayOfMonth(purchaseMonth, purchaseYear);
    const clampedClosingDay = Math.min(closingDay, lastDayOfMonth);

    let targetMonth = purchaseMonth;
    let targetYear = purchaseYear;

    if (purchaseDay > clampedClosingDay) {
      targetMonth += 1;
      if (targetMonth > 12) {
        targetMonth = 1;
        targetYear += 1;
      }
    }

    if (closingDay > dueDay) {
      targetMonth += 1;
      if (targetMonth > 12) {
        targetMonth = 1;
        targetYear += 1;
      }
    }

    return { month: targetMonth, year: targetYear };
  }

  private clampDayToMonth(day: number, month: number, year: number): number {
    return Math.min(day, this.getLastDayOfMonth(month, year));
  }

  private getLastDayOfMonth(month: number, year: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  private toMoneyDecimal(value: number): Prisma.Decimal {
    return new Prisma.Decimal(value).toDecimalPlaces(
      2,
      Prisma.Decimal.ROUND_HALF_UP,
    );
  }

  private decimalToNumber(value: Prisma.Decimal): number {
    return Number(value.toFixed(2));
  }

  private findOwnedRecurringTransaction(
    userId: string,
    id: string,
  ): Promise<RecurringTransactionWithRelations | null> {
    return this.prismaService.recurringTransaction.findFirst({
      where: {
        id,
        userId,
      },
      include: this.recurringInclude,
    });
  }

  private async ensureCategoryBelongsToUser(
    userId: string,
    categoryId: string,
  ): Promise<Category> {
    const category = await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  private async ensureCreditCardBelongsToUser(
    userId: string,
    creditCardId: string,
  ): Promise<CreditCard> {
    const creditCard = await this.prismaService.creditCard.findFirst({
      where: {
        id: creditCardId,
        userId,
      },
    });

    if (!creditCard) {
      throw new NotFoundException('Credit card not found.');
    }

    return creditCard;
  }

  private mapRecurringTransaction(
    item: RecurringTransactionWithRelations,
  ): RecurringTransactionResponse {
    return {
      id: item.id,
      creditCardId: item.creditCardId,
      categoryId: item.categoryId,
      description: item.description,
      amount: this.decimalToNumber(item.amount),
      transactionType: item.transactionType,
      paymentMethod: item.paymentMethod,
      billingDay: item.billingDay,
      startDate: item.startDate,
      endDate: item.endDate,
      isActive: item.isActive,
      canceledAt: item.canceledAt,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      category: this.mapCategory(item.category),
      creditCard: this.mapCreditCard(item.creditCard),
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

  private mapCreditCard(creditCard: CreditCard | null): CreditCardResponse | null {
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
}
