import type { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';

export function parseCorsOrigins(
  value: string | undefined,
  fallbackOrigins: string[] = [],
): string[] {
  const origins = (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : fallbackOrigins;
}

export function createCorsOriginValidator(
  allowedOrigins: string[],
): CustomOrigin {
  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  };
}
