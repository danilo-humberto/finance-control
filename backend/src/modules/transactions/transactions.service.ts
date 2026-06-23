import { Injectable, NotFoundException } from '@nestjs/common';
import type { Transaction } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    await this.ensureCategoryBelongsToUser(userId, dto.categoryId);

    if (dto.creditCardId) {
      await this.ensureCreditCardBelongsToUser(userId, dto.creditCardId);
    }

    return this.prismaService.transaction.create({
      data: {
        userId,
        creditCardId: dto.creditCardId ?? null,
        categoryId: dto.categoryId,
        description: dto.description,
        amount: dto.amount,
        transactionType: dto.transactionType,
        paymentMethod: dto.paymentMethod,
        purchaseDate: dto.purchaseDate,
        installmentsCount: dto.installmentsCount ?? 1,
        invoiceStartMonth: dto.invoiceStartMonth ?? null,
        invoiceStartYear: dto.invoiceStartYear ?? null,
        notes: dto.notes ?? null,
      },
    });
  }

  findAll(userId: string): Promise<Transaction[]> {
    return this.prismaService.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.findOwnedTransaction(userId, id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    return transaction;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    await this.findOne(userId, id);

    if (dto.categoryId) {
      await this.ensureCategoryBelongsToUser(userId, dto.categoryId);
    }

    if (dto.creditCardId) {
      await this.ensureCreditCardBelongsToUser(userId, dto.creditCardId);
    }

    return this.prismaService.transaction.update({
      where: {
        id,
      },
      data: {
        creditCardId: dto.creditCardId,
        categoryId: dto.categoryId,
        description: dto.description,
        amount: dto.amount,
        transactionType: dto.transactionType,
        paymentMethod: dto.paymentMethod,
        purchaseDate: dto.purchaseDate,
        installmentsCount: dto.installmentsCount,
        invoiceStartMonth: dto.invoiceStartMonth,
        invoiceStartYear: dto.invoiceStartYear,
        notes: dto.notes,
      },
    });
  }

  async remove(userId: string, id: string): Promise<Transaction> {
    await this.findOne(userId, id);

    return this.prismaService.transaction.delete({
      where: {
        id,
      },
    });
  }

  private findOwnedTransaction(
    userId: string,
    id: string,
  ): Promise<Transaction | null> {
    return this.prismaService.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });
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
}
