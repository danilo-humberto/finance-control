export type MockUser = {
  name: string;
  email: string;
  initials: string;
};

export type MockCreditCard = {
  id: string;
  name: string;
  logo: string;
  brand: string;
  type: string;
  limit: number;
  used: number;
  currentInvoiceTotal: number;
  dueDateLabel: string;
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

export type MockCategoriesSummary = {
  total: number;
  expenses: number;
  incomes: number;
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
  categoryName: string;
  categoryIcon: string;
  amount: number;
  dateLabel: string;
  installmentLabel: string;
  status: 'open' | 'paid' | 'canceled';
};

export type MockInvoiceSummary = {
  id: string;
  cardName: string;
  cardLogo: string;
  cardColor: string;
  status: 'open' | 'paid' | 'canceled';
  dueDate: string;
  bestPurchaseDate: string;
  total: number;
  limit: number;
  usedPercentage: number;
};

export type MockInvoiceFilters = {
  monthLabel: string;
  cardLabel: string;
  categoryLabel: string;
};

export type MockPurchaseFormDefaults = {
  purchaseDate: string;
  card: {
    name: string;
    logo: string;
    color: string;
  };
  category: {
    name: string;
    icon: string;
  };
  invoice: {
    label: string;
    closeDateLabel: string;
  };
};

export type MockCardsSummary = {
  totalLimit: number;
  usedLimit: number;
  availableLimit: number;
  openInvoiceTotal: number;
  openCardsCount: number;
  usedPercentage: number;
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

export type MockTransactionPaymentType = 'card' | 'pix' | 'account';

export type MockTransactionGroupKey = 'today' | 'yesterday' | 'week' | 'older';

export type MockTransaction = {
  id: string;
  description: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  paymentLabel: string;
  paymentType: MockTransactionPaymentType;
  groupKey: MockTransactionGroupKey;
  groupLabel: string;
  timeLabel: string;
  amount: number;
  type: 'expense' | 'income';
};

export type MockTransactionsSummary = {
  income: number;
  expense: number;
  balance: number;
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
    logo: 'nu',
    brand: 'Mastercard',
    type: 'Crédito',
    limit: 5000,
    used: 2150,
    currentInvoiceTotal: 1250,
    dueDateLabel: '05/06',
    closingDay: 5,
    dueDay: 5,
    color: '#6d28d9',
  },
  {
    id: 'card-santander',
    name: 'Santander',
    logo: 'S',
    brand: 'Visa',
    type: 'Crédito',
    limit: 4000,
    used: 1580,
    currentInvoiceTotal: 780.4,
    dueDateLabel: '10/06',
    closingDay: 8,
    dueDay: 10,
    color: '#dc2626',
  },
  {
    id: 'card-itau',
    name: 'Itaú',
    logo: 'Itaú',
    brand: 'Elo',
    type: 'Crédito e débito',
    limit: 3000,
    used: 0,
    currentInvoiceTotal: 0,
    dueDateLabel: '15/06',
    closingDay: 10,
    dueDay: 15,
    color: '#2563eb',
  },
  {
    id: 'card-c6',
    name: 'C6 Bank',
    logo: 'C6',
    brand: 'Mastercard',
    type: 'Crédito',
    limit: 4800,
    used: 0,
    currentInvoiceTotal: 0,
    dueDateLabel: '20/06',
    closingDay: 15,
    dueDay: 20,
    color: '#262626',
  },
];

export const mockCardsSummary: MockCardsSummary = {
  totalLimit: 16800,
  usedLimit: 9350,
  availableLimit: 7450,
  openInvoiceTotal: 2030.4,
  openCardsCount: 2,
  usedPercentage: 55.7,
};

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
    cardName: 'Itaú',
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

export const mockInvoiceSummary: MockInvoiceSummary = {
  id: 'invoice-nubank-detail',
  cardName: 'Nubank',
  cardLogo: 'nu',
  cardColor: '#7c3aed',
  status: 'open',
  dueDate: '05/06/2025',
  bestPurchaseDate: '25/05',
  total: 1250,
  limit: 4000,
  usedPercentage: 31,
};

export const mockInvoiceFilters: MockInvoiceFilters = {
  monthLabel: 'Mai/2025',
  cardLabel: 'Nubank',
  categoryLabel: 'Todas categorias',
};

export const mockPurchaseFormDefaults: MockPurchaseFormDefaults = {
  purchaseDate: '28/05/2025',
  card: {
    name: 'Nubank',
    logo: 'nu',
    color: '#7c3aed',
  },
  category: {
    name: 'Alimentação',
    icon: 'Utensils',
  },
  invoice: {
    label: 'Fatura atual',
    closeDateLabel: 'fecha em 05/06',
  },
};

export const mockCategories: MockCategory[] = [
  {
    id: 'cat-food',
    name: 'Alimentação',
    type: 'expense',
    icon: 'Utensils',
    color: '#22c55e',
    transactionsCount: 12,
  },
  {
    id: 'cat-transport',
    name: 'Transporte',
    type: 'expense',
    icon: 'Car',
    color: '#eab308',
    transactionsCount: 8,
  },
  {
    id: 'cat-shopping',
    name: 'Compras',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#a855f7',
    transactionsCount: 7,
  },
  {
    id: 'cat-home',
    name: 'Moradia',
    type: 'expense',
    icon: 'Home',
    color: '#38bdf8',
    transactionsCount: 5,
  },
  {
    id: 'cat-health',
    name: 'Saúde',
    type: 'expense',
    icon: 'Heart',
    color: '#f97316',
    transactionsCount: 4,
  },
  {
    id: 'cat-education',
    name: 'Educação',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#ec4899',
    transactionsCount: 3,
  },
  {
    id: 'cat-salary',
    name: 'Salário',
    type: 'income',
    icon: 'DollarSign',
    color: '#22c55e',
    transactionsCount: 1,
  },
  {
    id: 'cat-investments',
    name: 'Investimentos',
    type: 'income',
    icon: 'BookOpen',
    color: '#06b6d4',
    transactionsCount: 2,
  },
  {
    id: 'cat-other',
    name: 'Outros',
    type: 'expense',
    icon: 'Gift',
    color: '#3b82f6',
    transactionsCount: 2,
  },
];

export const mockCategoriesSummary: MockCategoriesSummary = {
  total: mockCategories.length,
  expenses: mockCategories.filter((category) => category.type === 'expense').length,
  incomes: mockCategories.filter((category) => category.type === 'income').length,
};

export const mockRecentTransactions: MockRecentTransaction[] = [
  {
    id: 'recent-market',
    description: 'Mercado Extra',
    categoryName: 'Alimentação',
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
    categoryName: 'Alimentação',
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

export const mockTransactions: MockTransaction[] = [
  {
    id: 'transaction-marketplace',
    description: 'Mercado Livre',
    categoryName: 'Compras',
    categoryIcon: 'ShoppingBag',
    categoryColor: '#a855f7',
    paymentLabel: 'Visa •••• 1234',
    paymentType: 'card',
    groupKey: 'today',
    groupLabel: 'Hoje, 20 de maio',
    timeLabel: '14:32',
    amount: -159.9,
    type: 'expense',
  },
  {
    id: 'transaction-restaurant',
    description: 'Restaurante Bom Sabor',
    categoryName: 'Alimentação',
    categoryIcon: 'Utensils',
    categoryColor: '#22c55e',
    paymentLabel: 'Mastercard •••• 4321',
    paymentType: 'card',
    groupKey: 'today',
    groupLabel: 'Hoje, 20 de maio',
    timeLabel: '12:15',
    amount: -85.5,
    type: 'expense',
  },
  {
    id: 'transaction-salary',
    description: 'Salário',
    categoryName: 'Salário',
    categoryIcon: 'DollarSign',
    categoryColor: '#22c55e',
    paymentLabel: 'Conta Bancária',
    paymentType: 'account',
    groupKey: 'today',
    groupLabel: 'Hoje, 20 de maio',
    timeLabel: '09:00',
    amount: 2450,
    type: 'income',
  },
  {
    id: 'transaction-uber',
    description: 'Uber',
    categoryName: 'Transporte',
    categoryIcon: 'Car',
    categoryColor: '#eab308',
    paymentLabel: 'Visa •••• 1234',
    paymentType: 'card',
    groupKey: 'yesterday',
    groupLabel: 'Ontem, 19 de maio',
    timeLabel: '22:47',
    amount: -27.9,
    type: 'expense',
  },
  {
    id: 'transaction-pharmacy',
    description: 'Farmácia Pague Menos',
    categoryName: 'Saúde',
    categoryIcon: 'Heart',
    categoryColor: '#f97316',
    paymentLabel: 'Elo •••• 5678',
    paymentType: 'card',
    groupKey: 'yesterday',
    groupLabel: 'Ontem, 19 de maio',
    timeLabel: '18:20',
    amount: -62.3,
    type: 'expense',
  },
  {
    id: 'transaction-sale',
    description: 'Venda de Produto',
    categoryName: 'Outros',
    categoryIcon: 'Gift',
    categoryColor: '#22c55e',
    paymentLabel: 'Conta Bancária',
    paymentType: 'account',
    groupKey: 'yesterday',
    groupLabel: 'Ontem, 19 de maio',
    timeLabel: '16:05',
    amount: 120,
    type: 'income',
  },
  {
    id: 'transaction-rent',
    description: 'Aluguel',
    categoryName: 'Moradia',
    categoryIcon: 'Home',
    categoryColor: '#eab308',
    paymentLabel: 'Pix',
    paymentType: 'pix',
    groupKey: 'yesterday',
    groupLabel: 'Ontem, 19 de maio',
    timeLabel: '10:00',
    amount: -1200,
    type: 'expense',
  },
  {
    id: 'transaction-market',
    description: 'Mercado Extra',
    categoryName: 'Alimentação',
    categoryIcon: 'Utensils',
    categoryColor: '#22c55e',
    paymentLabel: 'Nubank',
    paymentType: 'card',
    groupKey: 'week',
    groupLabel: 'Esta semana',
    timeLabel: 'Segunda',
    amount: -185.9,
    type: 'expense',
  },
  {
    id: 'transaction-course',
    description: 'Curso online',
    categoryName: 'Educação',
    categoryIcon: 'GraduationCap',
    categoryColor: '#ec4899',
    paymentLabel: 'Pix',
    paymentType: 'pix',
    groupKey: 'older',
    groupLabel: 'Anteriores',
    timeLabel: '15/05',
    amount: -149.9,
    type: 'expense',
  },
];

export const mockTransactionsSummary: MockTransactionsSummary = {
  income: mockTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0),
  expense: Math.abs(
    mockTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0),
  ),
  balance: mockTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  ),
};

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
    description: 'Salário',
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
    description: 'Farmácia',
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
    invoiceId: 'invoice-nubank-detail',
    description: 'Mercado Extra',
    categoryId: 'cat-food',
    categoryName: 'Alimentação',
    categoryIcon: 'ShoppingCart',
    amount: 85.4,
    dateLabel: '28/05',
    installmentLabel: 'Parcela 2/3',
    status: 'open',
  },
  {
    id: 'invoice-item-gas',
    invoiceId: 'invoice-nubank-detail',
    description: 'Posto Ipiranga',
    categoryId: 'cat-transport',
    categoryName: 'Transporte',
    categoryIcon: 'Fuel',
    amount: 120,
    dateLabel: '28/05',
    installmentLabel: 'À vista',
    status: 'open',
  },
  {
    id: 'invoice-item-restaurant',
    invoiceId: 'invoice-nubank-detail',
    description: 'Restaurante Sabores',
    categoryId: 'cat-food',
    categoryName: 'Alimentação',
    categoryIcon: 'Utensils',
    amount: 68.9,
    dateLabel: '27/05',
    installmentLabel: 'À vista',
    status: 'open',
  },
  {
    id: 'invoice-item-amazon',
    invoiceId: 'invoice-nubank-detail',
    description: 'Amazon',
    categoryId: 'cat-shopping',
    categoryName: 'Compras',
    categoryIcon: 'ShoppingBag',
    amount: 199.9,
    dateLabel: '26/05',
    installmentLabel: 'Parcela 3/6',
    status: 'open',
  },
  {
    id: 'invoice-item-renner',
    invoiceId: 'invoice-nubank-detail',
    description: 'Renner',
    categoryId: 'cat-shopping',
    categoryName: 'Compras',
    categoryIcon: 'Shirt',
    amount: 159.9,
    dateLabel: '26/05',
    installmentLabel: 'Parcela 1/4',
    status: 'open',
  },
  {
    id: 'invoice-item-cinema',
    invoiceId: 'invoice-nubank-detail',
    description: 'Cinema',
    categoryId: 'cat-entertainment',
    categoryName: 'Lazer',
    categoryIcon: 'Clapperboard',
    amount: 45,
    dateLabel: '25/05',
    installmentLabel: 'À vista',
    status: 'open',
  },
];
