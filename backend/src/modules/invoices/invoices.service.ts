import { Injectable, NotFoundException } from '@nestjs/common';
import {
  InstallmentStatus,
  Prisma,
  type Category,
  type CreditCard,
  type Installment,
  type Transaction,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

type InvoiceInstallmentWithRelations = Installment & {
  creditCard: CreditCard | null;
  transaction: Transaction & {
    category: Category;
    creditCard: CreditCard | null;
  };
};

export type InvoiceItemResponse = {
  id: string;
  description: string;
  amount: number;
  installmentNumber: number;
  totalInstallments: number;
  status: InstallmentStatus;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  };
  creditCard: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  transaction: {
    id: string;
    purchaseDate: Date;
  };
};

export type InvoiceResponse = {
  month: number;
  year: number;
  total: number;
  filters: {
    creditCardId: string | null;
    categoryId: string | null;
  };
  items: InvoiceItemResponse[];
};

@Injectable()
export class InvoicesService {
  private readonly installmentInclude = {
    creditCard: true,
    transaction: {
      include: {
        category: true,
        creditCard: true,
      },
    },
  } satisfies Prisma.InstallmentInclude;

  constructor(private readonly prismaService: PrismaService) {}

  async findOne(
    userId: string,
    query: QueryInvoiceDto,
  ): Promise<InvoiceResponse> {
    if (query.creditCardId) {
      await this.ensureCreditCardBelongsToUser(userId, query.creditCardId);
    }

    if (query.categoryId) {
      await this.ensureCategoryBelongsToUser(userId, query.categoryId);
    }

    const installments = await this.prismaService.installment.findMany({
      where: {
        userId,
        invoiceMonth: query.month,
        invoiceYear: query.year,
        status: InstallmentStatus.OPEN,
        creditCardId: query.creditCardId,
        transaction: query.categoryId
          ? {
              categoryId: query.categoryId,
            }
          : undefined,
      },
      include: this.installmentInclude,
      orderBy: [{ createdAt: 'asc' }, { installmentNumber: 'asc' }],
    });

    const total = installments.reduce(
      (sum, installment) => sum.plus(installment.amount),
      new Prisma.Decimal(0),
    );

    return {
      month: query.month,
      year: query.year,
      total: this.decimalToNumber(total),
      filters: {
        creditCardId: query.creditCardId ?? null,
        categoryId: query.categoryId ?? null,
      },
      items: installments.map((installment) =>
        this.mapInvoiceItem(installment),
      ),
    };
  }

  payInstallment(userId: string, id: string): Promise<InvoiceItemResponse> {
    return this.updateInstallmentStatus(userId, id, InstallmentStatus.PAID);
  }

  reopenInstallment(userId: string, id: string): Promise<InvoiceItemResponse> {
    return this.updateInstallmentStatus(userId, id, InstallmentStatus.OPEN);
  }

  cancelInstallment(userId: string, id: string): Promise<InvoiceItemResponse> {
    return this.updateInstallmentStatus(userId, id, InstallmentStatus.CANCELED);
  }

  private async updateInstallmentStatus(
    userId: string,
    id: string,
    status: InstallmentStatus,
  ): Promise<InvoiceItemResponse> {
    const installment = await this.prismaService.installment.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!installment) {
      throw new NotFoundException('Installment not found.');
    }

    const updatedInstallment = await this.prismaService.installment.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: this.installmentInclude,
    });

    return this.mapInvoiceItem(updatedInstallment);
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
      select: {
        id: true,
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
      select: {
        id: true,
      },
    });

    if (!creditCard) {
      throw new NotFoundException('Credit card not found.');
    }
  }

  private mapInvoiceItem(
    installment: InvoiceInstallmentWithRelations,
  ): InvoiceItemResponse {
    const creditCard =
      installment.creditCard ?? installment.transaction.creditCard;

    return {
      id: installment.id,
      description: installment.transaction.description,
      amount: this.decimalToNumber(installment.amount),
      installmentNumber: installment.installmentNumber,
      totalInstallments: installment.totalInstallments,
      status: installment.status,
      category: {
        id: installment.transaction.category.id,
        name: installment.transaction.category.name,
        color: installment.transaction.category.color,
        icon: installment.transaction.category.icon,
      },
      creditCard: creditCard
        ? {
            id: creditCard.id,
            name: creditCard.name,
            color: creditCard.color,
          }
        : null,
      transaction: {
        id: installment.transaction.id,
        purchaseDate: installment.transaction.purchaseDate,
      },
    };
  }

  private decimalToNumber(value: Prisma.Decimal): number {
    return value.toNumber();
  }
}
