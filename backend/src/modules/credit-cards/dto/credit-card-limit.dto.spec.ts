import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateCreditCardDto } from './create-credit-card.dto';
import {
  MAX_CREDIT_CARD_LIMIT_AMOUNT,
  MIN_CREDIT_CARD_LIMIT_AMOUNT,
} from './credit-card-validation.constants';
import { UpdateCreditCardDto } from './update-credit-card.dto';

function makeCreatePayload(limitAmount: number) {
  return {
    name: 'Nubank',
    limitAmount,
    closingDay: 5,
    dueDay: 10,
  };
}

async function validateCreateLimit(limitAmount: number) {
  return validate(
    plainToInstance(CreateCreditCardDto, makeCreatePayload(limitAmount)),
  );
}

async function validateUpdateLimit(limitAmount: number) {
  return validate(plainToInstance(UpdateCreditCardDto, { limitAmount }));
}

function getLimitAmountConstraintKeys(
  errors: Awaited<ReturnType<typeof validate>>,
) {
  const limitAmountError = errors.find(
    (error) => error.property === 'limitAmount',
  );

  return Object.keys(limitAmountError?.constraints ?? {});
}

describe('Credit card limit DTO validation', () => {
  it('allows the minimum and maximum accepted limit on create', async () => {
    await expect(
      validateCreateLimit(MIN_CREDIT_CARD_LIMIT_AMOUNT),
    ).resolves.toEqual([]);
    await expect(
      validateCreateLimit(MAX_CREDIT_CARD_LIMIT_AMOUNT),
    ).resolves.toEqual([]);
  });

  it('rejects zero, negative and above-maximum limits on create', async () => {
    const zeroLimitErrors = await validateCreateLimit(0);
    const negativeLimitErrors = await validateCreateLimit(-1);
    const aboveMaximumErrors = await validateCreateLimit(
      MAX_CREDIT_CARD_LIMIT_AMOUNT + 0.01,
    );

    expect(getLimitAmountConstraintKeys(zeroLimitErrors)).toContain('min');
    expect(getLimitAmountConstraintKeys(negativeLimitErrors)).toContain('min');
    expect(getLimitAmountConstraintKeys(aboveMaximumErrors)).toContain('max');
  });

  it('rejects limits with more than two decimal places on create', async () => {
    const errors = await validateCreateLimit(100.123);

    expect(getLimitAmountConstraintKeys(errors)).toContain('isNumber');
  });

  it('applies the same limit validation on update', async () => {
    await expect(validateUpdateLimit(2500.5)).resolves.toEqual([]);

    const belowMinimumErrors = await validateUpdateLimit(0);
    const aboveMaximumErrors = await validateUpdateLimit(
      MAX_CREDIT_CARD_LIMIT_AMOUNT + 0.01,
    );
    const decimalErrors = await validateUpdateLimit(100.123);

    expect(getLimitAmountConstraintKeys(belowMinimumErrors)).toContain('min');
    expect(getLimitAmountConstraintKeys(aboveMaximumErrors)).toContain('max');
    expect(getLimitAmountConstraintKeys(decimalErrors)).toContain('isNumber');
  });
});
