import { NotFoundException } from '@nestjs/common';
import { Prisma, type CreditCard } from '@prisma/client';

import type { PrismaService } from '../../prisma/prisma.service';
import { CreditCardsService } from './credit-cards.service';

describe('CreditCardsService', () => {
  let prismaService: {
    creditCard: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let service: CreditCardsService;

  const userId = 'user-id';
  const creditCard: CreditCard = {
    id: 'credit-card-id',
    userId,
    name: 'Nubank',
    lastFourDigits: '1234',
    limitAmount: new Prisma.Decimal(1500),
    closingDay: 10,
    dueDay: 17,
    color: '#820ad1',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
  const creditCardResponse = {
    id: creditCard.id,
    name: creditCard.name,
    lastFourDigits: creditCard.lastFourDigits,
    limitAmount: 1500,
    closingDay: creditCard.closingDay,
    dueDay: creditCard.dueDay,
    color: creditCard.color,
    isActive: creditCard.isActive,
    createdAt: creditCard.createdAt,
    updatedAt: creditCard.updatedAt,
  };

  beforeEach(() => {
    prismaService = {
      creditCard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new CreditCardsService(
      prismaService as unknown as PrismaService,
    );
  });

  it('creates a credit card using the authenticated user id', async () => {
    prismaService.creditCard.create.mockResolvedValue(creditCard);

    await expect(
      service.create(userId, {
        name: creditCard.name,
        lastFourDigits: creditCard.lastFourDigits ?? undefined,
        limitAmount: 1500,
        closingDay: creditCard.closingDay,
        dueDay: creditCard.dueDay,
        color: creditCard.color ?? undefined,
      }),
    ).resolves.toEqual(creditCardResponse);

    expect(prismaService.creditCard.create).toHaveBeenCalledWith({
      data: {
        userId,
        name: creditCard.name,
        lastFourDigits: creditCard.lastFourDigits,
        limitAmount: 1500,
        closingDay: creditCard.closingDay,
        dueDay: creditCard.dueDay,
        color: creditCard.color,
        isActive: true,
      },
    });
  });

  it('lists only credit cards from the authenticated user', async () => {
    prismaService.creditCard.findMany.mockResolvedValue([creditCard]);

    await expect(service.findAll(userId)).resolves.toEqual([
      creditCardResponse,
    ]);

    expect(prismaService.creditCard.findMany).toHaveBeenCalledWith({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('throws not found when the credit card does not belong to the user', async () => {
    prismaService.creditCard.findFirst.mockResolvedValue(null);

    await expect(service.findOne(userId, creditCard.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prismaService.creditCard.findFirst).toHaveBeenCalledWith({
      where: {
        id: creditCard.id,
        userId,
      },
    });
  });

  it('updates only credit cards owned by the authenticated user', async () => {
    prismaService.creditCard.findFirst.mockResolvedValue(creditCard);
    prismaService.creditCard.update.mockResolvedValue({
      ...creditCard,
      name: 'Inter',
    });

    const updatedCreditCard = await service.update(userId, creditCard.id, {
      name: 'Inter',
    });

    expect(updatedCreditCard).toMatchObject({
      name: 'Inter',
    });
    expect(updatedCreditCard).not.toHaveProperty('userId');

    expect(prismaService.creditCard.update).toHaveBeenCalledWith({
      where: {
        id: creditCard.id,
      },
      data: {
        name: 'Inter',
        lastFourDigits: undefined,
        limitAmount: undefined,
        closingDay: undefined,
        dueDay: undefined,
        color: undefined,
        isActive: undefined,
      },
    });
  });

  it('deletes only credit cards owned by the authenticated user', async () => {
    prismaService.creditCard.findFirst.mockResolvedValue(creditCard);
    prismaService.creditCard.delete.mockResolvedValue(creditCard);

    await expect(service.remove(userId, creditCard.id)).resolves.toEqual(
      creditCardResponse,
    );

    expect(prismaService.creditCard.delete).toHaveBeenCalledWith({
      where: {
        id: creditCard.id,
      },
    });
  });
});
