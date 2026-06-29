import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreditCard } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

export type CreditCardResponse = Omit<CreditCard, 'limitAmount' | 'userId'> & {
  limitAmount: number;
};

@Injectable()
export class CreditCardsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    dto: CreateCreditCardDto,
  ): Promise<CreditCardResponse> {
    const creditCard = await this.prismaService.creditCard.create({
      data: {
        userId,
        name: dto.name,
        lastFourDigits: dto.lastFourDigits ?? null,
        limitAmount: dto.limitAmount,
        closingDay: dto.closingDay,
        dueDay: dto.dueDay,
        color: dto.color ?? null,
        isActive: dto.isActive ?? true,
      },
    });

    return this.mapCreditCard(creditCard);
  }

  async findAll(userId: string): Promise<CreditCardResponse[]> {
    const creditCards = await this.prismaService.creditCard.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return creditCards.map((creditCard) => this.mapCreditCard(creditCard));
  }

  async findOne(userId: string, id: string): Promise<CreditCardResponse> {
    const creditCard = await this.findOwnedCreditCard(userId, id);

    if (!creditCard) {
      throw new NotFoundException('Credit card not found.');
    }

    return this.mapCreditCard(creditCard);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCreditCardDto,
  ): Promise<CreditCardResponse> {
    await this.findOne(userId, id);

    const creditCard = await this.prismaService.creditCard.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        lastFourDigits: dto.lastFourDigits,
        limitAmount: dto.limitAmount,
        closingDay: dto.closingDay,
        dueDay: dto.dueDay,
        color: dto.color,
        isActive: dto.isActive,
      },
    });

    return this.mapCreditCard(creditCard);
  }

  async remove(userId: string, id: string): Promise<CreditCardResponse> {
    await this.findOne(userId, id);

    const creditCard = await this.prismaService.creditCard.delete({
      where: {
        id,
      },
    });

    return this.mapCreditCard(creditCard);
  }

  private findOwnedCreditCard(
    userId: string,
    id: string,
  ): Promise<CreditCard | null> {
    return this.prismaService.creditCard.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  private mapCreditCard(creditCard: CreditCard): CreditCardResponse {
    return {
      id: creditCard.id,
      name: creditCard.name,
      lastFourDigits: creditCard.lastFourDigits,
      limitAmount: creditCard.limitAmount.toNumber(),
      closingDay: creditCard.closingDay,
      dueDay: creditCard.dueDay,
      color: creditCard.color,
      isActive: creditCard.isActive,
      createdAt: creditCard.createdAt,
      updatedAt: creditCard.updatedAt,
    };
  }
}
