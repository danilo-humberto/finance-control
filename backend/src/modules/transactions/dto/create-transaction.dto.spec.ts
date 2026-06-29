import 'reflect-metadata';

import { PaymentMethod, TransactionType } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateTransactionDto } from './create-transaction.dto';

function makeValidPayload(overrides: Partial<CreateTransactionDto> = {}) {
  return {
    creditCardId: '33333333-3333-4333-8333-333333333333',
    categoryId: '22222222-2222-4222-8222-222222222222',
    description: 'Compra parcelada',
    amount: 120,
    transactionType: TransactionType.EXPENSE,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    purchaseDate: '2026-06-28',
    installmentsCount: 48,
    invoiceStartMonth: 7,
    invoiceStartYear: 2026,
    ...overrides,
  };
}

describe('CreateTransactionDto', () => {
  it('allows up to 48 installments', async () => {
    const dto = plainToInstance(CreateTransactionDto, makeValidPayload());

    await expect(validate(dto)).resolves.toEqual([]);
  });

  it('rejects more than 48 installments', async () => {
    const dto = plainToInstance(
      CreateTransactionDto,
      makeValidPayload({
        installmentsCount: 49,
      }),
    );

    const errors = await validate(dto);
    const installmentsCountError = errors.find(
      (error) => error.property === 'installmentsCount',
    );

    expect(installmentsCountError?.constraints).toHaveProperty('max');
  });
});
