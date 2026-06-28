export type CreditCard = {
  id: string;
  name: string;
  limitAmount: number;
  closingDay: number;
  dueDay: number;
  color?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCreditCardPayload = {
  name: string;
  limitAmount: number;
  closingDay: number;
  dueDay: number;
  color?: string;
  isActive?: boolean;
};

export type UpdateCreditCardPayload = Partial<CreateCreditCardPayload>;
