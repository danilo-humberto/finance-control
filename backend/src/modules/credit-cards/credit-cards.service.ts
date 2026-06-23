import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreditCard } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

@Injectable()
export class CreditCardsService {
  constructor(private readonly prismaService: PrismaService) {}

  create(userId: string, dto: CreateCreditCardDto): Promise<CreditCard> {
    return this.prismaService.creditCard.create({
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
  }

  findAll(userId: string): Promise<CreditCard[]> {
    return this.prismaService.creditCard.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string): Promise<CreditCard> {
    const creditCard = await this.findOwnedCreditCard(userId, id);

    if (!creditCard) {
      throw new NotFoundException('Credit card not found.');
    }

    return creditCard;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCreditCardDto,
  ): Promise<CreditCard> {
    await this.findOne(userId, id);

    return this.prismaService.creditCard.update({
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
  }

  async remove(userId: string, id: string): Promise<CreditCard> {
    await this.findOne(userId, id);

    return this.prismaService.creditCard.delete({
      where: {
        id,
      },
    });
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
}
