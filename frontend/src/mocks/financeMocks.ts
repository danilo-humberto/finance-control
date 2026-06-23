export type MockUser = {
  name: string;
  email: string;
  initials: string;
};

export type MockCreditCard = {
  id: string;
  name: string;
  brand: string;
  type: string;
  lastFourDigits: string;
  limit: number;
  used: number;
  closingDay: number;
  dueDay: number;
  color: string;
};

export type MockInvoice = {
  id: string;
  creditCardId: string;
  month: number;
  year: number;
  status: 'open' | 'paid' | 'canceled';
  total: number;
  dueDate: string;
};

export type MockCategory = {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  transactionsCount: number;
};

export type MockMovement = {
  id: string;
  description: string;
  categoryId: string;
  paymentLabel: string;
  amount: number;
  type: 'expense' | 'income';
  timeLabel: string;
};

export type MockInvoiceItem = {
  id: string;
  invoiceId: string;
  description: string;
  categoryId: string;
  amount: number;
  installmentLabel: string;
  status: 'open' | 'paid' | 'canceled';
};

export type MockCurrentInvoice = {
  id: string;
  creditCardId: string;
  cardName: string;
  cardLogo: string;
  cardColor: string;
  status: 'open' | 'paid' | 'canceled';
  total: number;
  dueDate: string;
  limit: number;
  used: number;
  usedPercentage: number;
};

export type MockRecentTransaction = {
  id: string;
  description: string;
  categoryName: string;
  categoryIcon: string;
  paymentLabel: string;
  dateLabel: string;
  amount: number;
  type: 'expense' | 'income';
};

export const mockUser: MockUser = {
  name: 'Danilo Humberto',
  email: 'danilo@example.com',
  initials: 'DH',
};

export const mockCreditCards: MockCreditCard[] = [
  {
    id: 'card-nubank',
    name: 'Nubank',
    brand: 'Mastercard',
    type: 'Credito',
    lastFourDigits: '1234',
    limit: 5000,
    used: 1256.8,
    closingDay: 5,
    dueDay: 20,
    color: '#6d28d9',
  },
  {
    id: 'card-santander',
    name: 'Santander',
    brand: 'Visa',
    type: 'Credito',
    lastFourDigits: '9012',
    limit: 3500,
    used: 872.4,
    closingDay: 8,
    dueDay: 15,
    color: '#dc2626',
  },
  {
    id: 'card-itau',
    name: 'Itau',
    brand: 'Elo',
    type: 'Credito e debito',
    lastFourDigits: '5678',
    limit: 4200,
    used: 1180.1,
    closingDay: 10,
    dueDay: 25,
    color: '#2563eb',
  },
];

export const mockInvoices: MockInvoice[] = [
  {
    id: 'invoice-nubank-current',
    creditCardId: 'card-nubank',
    month: 5,
    year: 2025,
    status: 'open',
    total: 1256.8,
    dueDate: '20/05/2025',
  },
  {
    id: 'invoice-santander-current',
    creditCardId: 'card-santander',
    month: 5,
    year: 2025,
    status: 'open',
    total: 872.4,
    dueDate: '15/05/2025',
  },
];

export const mockCurrentInvoices: MockCurrentInvoice[] = [
  {
    id: 'current-invoice-nubank',
    creditCardId: 'card-nubank',
    cardName: 'Nubank',
    cardLogo: 'nu',
    cardColor: '#7c3aed',
    status: 'open',
    total: 1250,
    dueDate: '05/06',
    limit: 4000,
    used: 1250,
    usedPercentage: 31,
  },
  {
    id: 'current-invoice-santander',
    creditCardId: 'card-santander',
    cardName: 'Santander',
    cardLogo: 'S',
    cardColor: '#dc2626',
    status: 'open',
    total: 780.4,
    dueDate: '10/06',
    limit: 3000,
    used: 780.4,
    usedPercentage: 26,
  },
  {
    id: 'current-invoice-itau',
    creditCardId: 'card-itau',
    cardName: 'Itau',
    cardLogo: 'itau',
    cardColor: '#2563eb',
    status: 'open',
    total: 1180.1,
    dueDate: '25/06',
    limit: 4200,
    used: 1180.1,
    usedPercentage: 28,
  },
];

export const mockCategories: MockCategory[] = [
  {
    id: 'cat-food',
    name: 'Alimentacao',
    type: 'expense',
    icon: 'Utensils',
    color: '#22c55e',
    transactionsCount: 128,
  },
  {
    id: 'cat-transport',
    name: 'Transporte',
    type: 'expense',
    icon: 'Car',
    color: '#f59e0b',
    transactionsCount: 41,
  },
  {
    id: 'cat-shopping',
    name: 'Compras',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#7c3aed',
    transactionsCount: 37,
  },
  {
    id: 'cat-health',
    name: 'Saude',
    type: 'expense',
    icon: 'Heart',
    color: '#ec4899',
    transactionsCount: 18,
  },
  {
    id: 'cat-salary',
    name: 'Salario',
    type: 'income',
    icon: 'DollarSign',
    color: '#16a34a',
    transactionsCount: 12,
  },
  {
    id: 'cat-home',
    name: 'Moradia',
    type: 'expense',
    icon: 'Home',
    color: '#38bdf8',
    transactionsCount: 24,
  },
];

export const mockRecentTransactions: MockRecentTransaction[] = [
  {
    id: 'recent-market',
    description: 'Mercado Extra',
    categoryName: 'Alimentacao',
    categoryIcon: 'ShoppingCart',
    paymentLabel: 'Nubank',
    dateLabel: '28/05',
    amount: -85.4,
    type: 'expense',
  },
  {
    id: 'recent-gas',
    description: 'Posto Ipiranga',
    categoryName: 'Transporte',
    categoryIcon: 'Fuel',
    paymentLabel: 'Santander',
    dateLabel: '28/05',
    amount: -120,
    type: 'expense',
  },
  {
    id: 'recent-restaurant',
    description: 'Restaurante Sabores',
    categoryName: 'Alimentacao',
    categoryIcon: 'Utensils',
    paymentLabel: 'Nubank',
    dateLabel: '27/05',
    amount: -68.9,
    type: 'expense',
  },
  {
    id: 'recent-amazon',
    description: 'Amazon',
    categoryName: 'Compras',
    categoryIcon: 'ShoppingBag',
    paymentLabel: 'Nubank',
    dateLabel: '26/05',
    amount: -199.9,
    type: 'expense',
  },
  {
    id: 'recent-renner',
    description: 'Renner',
    categoryName: 'Compras',
    categoryIcon: 'Shirt',
    paymentLabel: 'Santander',
    dateLabel: '26/05',
    amount: -159.9,
    type: 'expense',
  },
  {
    id: 'recent-cinema',
    description: 'Cinema',
    categoryName: 'Lazer',
    categoryIcon: 'Clapperboard',
    paymentLabel: 'Nubank',
    dateLabel: '25/05',
    amount: -45,
    type: 'expense',
  },
];

export const mockMovements: MockMovement[] = [
  {
    id: 'movement-market',
    description: 'Mercado Extra',
    categoryId: 'cat-food',
    paymentLabel: 'Visa 1234',
    amount: -159.9,
    type: 'expense',
    timeLabel: '10:32',
  },
  {
    id: 'movement-restaurant',
    description: 'Restaurante Bom Sabor',
    categoryId: 'cat-food',
    paymentLabel: 'Mastercard 3411',
    amount: -85.5,
    type: 'expense',
    timeLabel: '12:45',
  },
  {
    id: 'movement-salary',
    description: 'Salario',
    categoryId: 'cat-salary',
    paymentLabel: 'Conta bancaria',
    amount: 2450,
    type: 'income',
    timeLabel: '09:00',
  },
  {
    id: 'movement-uber',
    description: 'Uber',
    categoryId: 'cat-transport',
    paymentLabel: 'Visa 1234',
    amount: -27.9,
    type: 'expense',
    timeLabel: 'Ontem',
  },
  {
    id: 'movement-pharmacy',
    description: 'Farmacia',
    categoryId: 'cat-health',
    paymentLabel: 'Elo 5678',
    amount: -62.3,
    type: 'expense',
    timeLabel: 'Ontem',
  },
];

export const mockInvoiceItems: MockInvoiceItem[] = [
  {
    id: 'invoice-item-market',
    invoiceId: 'invoice-nubank-current',
    description: 'Mercado Extra',
    categoryId: 'cat-food',
    amount: 159.9,
    installmentLabel: '1/1',
    status: 'open',
  },
  {
    id: 'invoice-item-restaurant',
    invoiceId: 'invoice-nubank-current',
    description: 'Restaurante Bom Sabor',
    categoryId: 'cat-food',
    amount: 85.5,
    installmentLabel: '1/1',
    status: 'open',
  },
  {
    id: 'invoice-item-shopping',
    invoiceId: 'invoice-santander-current',
    description: 'Compras online',
    categoryId: 'cat-shopping',
    amount: 310.2,
    installmentLabel: '2/3',
    status: 'open',
  },
];
