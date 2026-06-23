import type { User } from '@prisma/client';

export type AuthenticatedRequest = {
  headers: {
    authorization?: string | string[];
  };
  user?: User;
};
