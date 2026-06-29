import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { QueryTransactionsDto } from './query-transactions.dto';

describe('QueryTransactionsDto', () => {
  it('accepts pagination within the maximum limit', async () => {
    const dto = plainToInstance(QueryTransactionsDto, {
      page: '2',
      limit: '100',
    });

    await expect(validate(dto)).resolves.toEqual([]);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(100);
  });

  it('rejects pagination above the maximum limit', async () => {
    const dto = plainToInstance(QueryTransactionsDto, {
      page: '1',
      limit: '101',
    });

    const errors = await validate(dto);
    const limitError = errors.find((error) => error.property === 'limit');

    expect(limitError?.constraints).toHaveProperty('max');
  });
});
