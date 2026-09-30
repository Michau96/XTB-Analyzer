export type AssetCategory = 'STOCK' | 'ETF' | 'CFD' | 'CRYPTO' | 'FOREX' | 'OTHER';
export type TradeType = 'BUY' | 'SELL';

export type CashOperationType = 
  | 'DEPOSIT'            // Wpłata
  | 'WITHDRAWAL'          // Wypłata
  | 'DIVIDEND'            // Dywidenda
  | 'TAX'                 // Podatek u źródła (withholding tax)
  | 'INTEREST'            // Oprocentowanie wolnych środków
  | 'FEE'                 // Opłaty (np. SEC fee, prowizje)
  | 'TRANSFER'            // Przelew między rachunkami
  | 'OTHER';

export interface XtbTrade {
  id: string; // Position ID or unique generated id
  positionId?: string;
  accountNumber?: string;
  instrument: string;
  ticker: string;
  category: AssetCategory;
  type: TradeType;
  volume: number;
  openPrice: number;
  openTime: string; // ISO string
  closePrice: number;
  closeTime: string; // ISO string
  profitNet: number; // PLN
  profitGross: number; // PLN
  purchaseValue?: number; // PLN
  saleValue?: number; // PLN
  commission: number; // PLN
  swap?: number;
  openConversionRate?: number;
  closeConversionRate?: number;
  origin?: string;
  comment?: string;
  durationDays?: number;
  returnPercent?: number; // (closePrice - openPrice) / openPrice * 100
}

export interface XtbCashOperation {
  id: string;
  operationId?: string;
  accountNumber?: string;
  time: string; // ISO string
  type: CashOperationType;
  typeRaw: string; // e.g. "Wpłata", "Dywidenda", "Podatek"
  amount: number; // PLN (positive or negative)
  currency: string;
  comment?: string;
}

export interface XtbOpenPosition {
  id: string;
  positionId: string;
  accountNumber?: string;
  instrument: string;
  ticker: string;
  category: AssetCategory;
  type: TradeType;
  volume: number;
  openPrice: number;
  openTime: string;
  currentPrice: number;
  purchaseValue: number;
  currentValue: number;
  unrealizedProfit: number;
  returnPercent: number;
}

export interface PortfolioSummary {
  accountNumbers: string[];
  totalDeposit: number;
  totalWithdrawal: number;
  netDeposit: number;
  totalRealizedProfit: number;
  totalDividendsNet: number;
  totalDividendsGross: number;
  totalTaxPaid: number;
  totalInterest: number;
  totalFees: number;
  portfolioValue: number;
  totalReturnAmount: number;
  totalReturnPercentage: number;
  winRate: number; // 0 - 100%
  profitFactor: number;
  totalTradesCount: number;
  winningTradesCount: number;
  losingTradesCount: number;
  avgTradeProfit: number;
  avgHoldingDays: number;
  bestTrade: { ticker: string; profit: number; percent: number } | null;
  worstTrade: { ticker: string; profit: number; percent: number } | null;
}

export interface AssetAllocationPoint {
  date: string;
  timestamp: number;
  stocks: number;
  etfs: number;
  cfdCrypto: number;
  cash: number;
  total: number;
}

export interface CumulativePnLPoint {
  date: string;
  timestamp: number;
  cumulativePnL: number;
  dailyPnL: number;
  portfolioValue: number;
}

export interface BenchmarkComparisonPoint {
  date: string;
  portfolioReturn: number; // %
  sp500Return: number;     // %
  msciAcwiReturn: number;  // %
  wig20Return: number;     // %
}

export interface ParseResult {
  success: boolean;
  accountNumbers: string[];
  trades: XtbTrade[];
  cashOperations: XtbCashOperation[];
  openPositions: XtbOpenPosition[];
  warnings: string[];
  filesProcessedCount: number;
  newTradesCount: number;
  duplicateTradesCount: number;
  newOperationsCount: number;
  duplicateOperationsCount: number;
}

export type DateFilterRange = 'ALL' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'CUSTOM';
