export type CreditCard = {
  id: string;
  name: string;
  lastFourDigits?: string | null;
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
  lastFourDigits?: string;
  limitAmount: number;
  closingDay: number;
  dueDay: number;
  color?: string;
  isActive?: boolean;
};

export type UpdateCreditCardPayload = Partial<CreateCreditCardPayload>;
