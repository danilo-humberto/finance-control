export type InstallmentStatus = 'OPEN' | 'PAID' | 'CANCELED';

export type InvoiceInstallment = {
  id: string;
  description: string;
  amount: number;
  installmentNumber: number;
  totalInstallments: number;
  status: InstallmentStatus;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  };
  creditCard: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  transaction: {
    id: string;
    purchaseDate: string;
  };
};

export type Invoice = {
  month: number;
  year: number;
  total: number;
  filters: {
    creditCardId: string | null;
    categoryId: string | null;
  };
  items: InvoiceInstallment[];
};

export type InvoiceFilters = {
  month: number;
  year: number;
  creditCardId?: string;
  categoryId?: string;
};
