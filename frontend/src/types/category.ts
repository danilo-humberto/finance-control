export type CategoryType = 'EXPENSE' | 'INCOME';

export type Category = {
  id: string;
  userId?: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  type: CategoryType;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCategoryPayload = {
  name: string;
  icon?: string;
  color?: string;
  type: CategoryType;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
