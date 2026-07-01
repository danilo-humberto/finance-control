import { createCorsOriginValidator, parseCorsOrigins } from './cors-options';

describe('parseCorsOrigins', () => {
  it('parses comma-separated origins and removes empty values', () => {
    expect(
      parseCorsOrigins(' http://localhost:5173, https://app.example.com, '),
    ).toEqual(['http://localhost:5173', 'https://app.example.com']);
  });

  it('uses fallback origins when no value is provided', () => {
    expect(parseCorsOrigins(undefined, ['http://localhost:5173'])).toEqual([
      'http://localhost:5173',
    ]);
  });
});

describe('createCorsOriginValidator', () => {
  it('allows requests without origin', () => {
    const validator = createCorsOriginValidator(['https://app.example.com']);

    validator(undefined, (error, origin) => {
      expect(error).toBeNull();
      expect(origin).toBe(true);
    });
  });

  it('allows configured origins', () => {
    const validator = createCorsOriginValidator(['https://app.example.com']);

    validator('https://app.example.com', (error, origin) => {
      expect(error).toBeNull();
      expect(origin).toBe(true);
    });
  });

  it('blocks origins that are not configured', () => {
    const validator = createCorsOriginValidator(['https://app.example.com']);

    validator('https://evil.example.com', (error, origin) => {
      expect(error).toBeInstanceOf(Error);
      expect(origin).toBeUndefined();
    });
  });
});
