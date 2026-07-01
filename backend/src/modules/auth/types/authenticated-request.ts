import type { User } from '@prisma/client';

export type AuthenticatedRequest = {
  headers: {
    Authorization?: string | string[];
    authorization?: string | string[];
  };
  user?: User;
};
