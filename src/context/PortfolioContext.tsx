import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  calculatePortfolioSummary,
  generateAssetAllocationTimeline,
  generateBenchmarkComparison,
  generateCumulativePnLTimeline,
} from '../lib/analytics/metrics';
import {
  SAMPLE_CASH_OPERATIONS,
  SAMPLE_OPEN_POSITIONS,
  SAMPLE_TRADES,
} from '../lib/data/sampleData';
import {
  AssetAllocationPoint,
  AssetCategory,
  BenchmarkComparisonPoint,
  CumulativePnLPoint,
  DateFilterRange,
  ParseResult,
  PortfolioSummary,
  XtbCashOperation,
  XtbOpenPosition,
  XtbTrade,
} from '../types/portfolio';

interface PortfolioContextType {
  accountNumbers: string[];
  accountFilter: string; // 'ALL' or specific account number
  setAccountFilter: (acc: string) => void;

  trades: XtbTrade[];
  cashOperations: XtbCashOperation[];
  openPositions: XtbOpenPosition[];

  filteredTrades: XtbTrade[];
  filteredCashOperations: XtbCashOperation[];
  summary: PortfolioSummary;
  assetAllocation: AssetAllocationPoint[];
  cumulativePnL: CumulativePnLPoint[];
  benchmarkComparison: BenchmarkComparisonPoint[];

  dateFilter: DateFilterRange;
  setDateFilter: (filter: DateFilterRange) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;

  categoryFilter: AssetCategory | 'ALL';
  setCategoryFilter: (cat: AssetCategory | 'ALL') => void;

  privacyMode: boolean;
  togglePrivacyMode: () => void;
  formatMoney: (amount: number | undefined | null, curr?: string, decimals?: number) => string;

  theme: 'dark' | 'light';
  toggleTheme: () => void;

  importResult: ParseResult | null;
  setImportResult: (res: ParseResult | null) => void;

  addParsedData: (res: ParseResult, replace?: boolean) => void;
  loadDemoData: () => void;
  clearPortfolioData: () => void;
  deleteTrade: (id: string) => void;
  deleteCashOp: (id: string) => void;
  exportPortfolioToJson: () => void;
  exportTradesToCsv: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const TRADES_STORAGE_KEY = 'xtb_unified_trades_v2';
const CASH_STORAGE_KEY = 'xtb_unified_cash_v2';
const OPEN_STORAGE_KEY = 'xtb_unified_open_v2';
const ACCOUNTS_STORAGE_KEY = 'xtb_unified_accounts_v2';
const THEME_KEY = 'xtb_theme_mode';
const PRIVACY_KEY = 'xtb_privacy_mode';

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountNumbers, setAccountNumbers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['51499252', '51863390'];
  });

  const [accountFilter, setAccountFilter] = useState<string>('ALL');

  const [trades, setTrades] = useState<XtbTrade[]>(() => {
    try {
      const saved = localStorage.getItem(TRADES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SAMPLE_TRADES;
  });

  const [cashOperations, setCashOperations] = useState<XtbCashOperation[]>(() => {
    try {
      const saved = localStorage.getItem(CASH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SAMPLE_CASH_OPERATIONS;
  });

  const [openPositions, setOpenPositions] = useState<XtbOpenPosition[]>(() => {
    try {
      const saved = localStorage.getItem(OPEN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SAMPLE_OPEN_POSITIONS;
  });

  const [dateFilter, setDateFilter] = useState<DateFilterRange>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'ALL'>('ALL');

  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem(PRIVACY_KEY) === 'true';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [importResult, setImportResult] = useState<ParseResult | null>(null);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Persist data in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(trades));
      localStorage.setItem(CASH_STORAGE_KEY, JSON.stringify(cashOperations));
      localStorage.setItem(OPEN_STORAGE_KEY, JSON.stringify(openPositions));
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accountNumbers));
    } catch (e) {
      console.error('Error saving unified portfolio', e);
    }
  }, [trades, cashOperations, openPositions, accountNumbers]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const togglePrivacyMode = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem(PRIVACY_KEY, String(next));
      return next;
    });
  };

  const addParsedData = (res: ParseResult, replace: boolean = false) => {
    if (replace) {
      setTrades(res.trades);
      setCashOperations(res.cashOperations);
      setOpenPositions(res.openPositions || []);
      setAccountNumbers(res.accountNumbers);
    } else {
      // Unified merge across all files/accounts
      const tradeMap = new Map<string, XtbTrade>();
      trades.forEach((t) => tradeMap.set(t.id, t));
      res.trades.forEach((t) => tradeMap.set(t.id, t));

      const opMap = new Map<string, XtbCashOperation>();
      cashOperations.forEach((o) => opMap.set(o.id, o));
      res.cashOperations.forEach((o) => opMap.set(o.id, o));

      setTrades(
        Array.from(tradeMap.values()).sort(
          (a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime()
        )
      );
      setCashOperations(
        Array.from(opMap.values()).sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        )
      );

      if (res.openPositions && res.openPositions.length > 0) {
        const openMap = new Map<string, XtbOpenPosition>();
        openPositions.forEach((o) => openMap.set(o.id, o));
        res.openPositions.forEach((o) => openMap.set(o.id, o));
        setOpenPositions(Array.from(openMap.values()));
      }

      // Merge account numbers
      const mergedAccounts = Array.from(new Set([...accountNumbers, ...res.accountNumbers]));
      setAccountNumbers(mergedAccounts);
    }
  };

  const loadDemoData = () => {
    setTrades(SAMPLE_TRADES);
    setCashOperations(SAMPLE_CASH_OPERATIONS);
    setOpenPositions(SAMPLE_OPEN_POSITIONS);
    setAccountNumbers(['51499252', '51863390']);
  };

  const clearPortfolioData = () => {
    setTrades([]);
    setCashOperations([]);
    setOpenPositions([]);
    setAccountNumbers([]);
    localStorage.removeItem(TRADES_STORAGE_KEY);
    localStorage.removeItem(CASH_STORAGE_KEY);
    localStorage.removeItem(OPEN_STORAGE_KEY);
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
  };

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteCashOp = (id: string) => {
    setCashOperations((prev) => prev.filter((o) => o.id !== id));
  };

  const formatMoney = (amount: number | undefined | null, curr: string = 'PLN', decimals: number = 2): string => {
    if (privacyMode) return '••••••';
    if (amount === undefined || amount === null || isNaN(amount)) return `0,00 ${curr}`;

    const formatted = new Intl.NumberFormat('pl-PL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);

    return `${formatted} ${curr}`;
  };

  // Filtered trades by account, date, and category
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      // Account filter
      if (accountFilter !== 'ALL' && t.accountNumber && t.accountNumber !== accountFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) {
        return false;
      }

      // Date filter
      if (dateFilter === 'ALL') return true;

      const tradeDate = new Date(t.closeTime).getTime();
      const now = new Date().getTime();

      if (dateFilter === '1M') return tradeDate >= now - 30 * 86400 * 1000;
      if (dateFilter === '3M') return tradeDate >= now - 90 * 86400 * 1000;
      if (dateFilter === '6M') return tradeDate >= now - 180 * 86400 * 1000;
      if (dateFilter === '1Y') return tradeDate >= now - 365 * 86400 * 1000;
      if (dateFilter === 'YTD') {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
        return tradeDate >= startOfYear;
      }
      if (dateFilter === 'CUSTOM') {
        if (customStartDate && tradeDate < new Date(customStartDate).getTime()) return false;
        if (customEndDate && tradeDate > new Date(customEndDate).getTime() + 86400000) return false;
      }

      return true;
    });
  }, [trades, accountFilter, dateFilter, categoryFilter, customStartDate, customEndDate]);

  // Filtered cash operations
  const filteredCashOperations = useMemo(() => {
    return cashOperations.filter((op) => {
      // Account filter
      if (accountFilter !== 'ALL' && op.accountNumber && op.accountNumber !== accountFilter) {
        return false;
      }

      if (dateFilter === 'ALL') return true;

      const opDate = new Date(op.time).getTime();
      const now = new Date().getTime();

      if (dateFilter === '1M') return opDate >= now - 30 * 86400 * 1000;
      if (dateFilter === '3M') return opDate >= now - 90 * 86400 * 1000;
      if (dateFilter === '6M') return opDate >= now - 180 * 86400 * 1000;
      if (dateFilter === '1Y') return opDate >= now - 365 * 86400 * 1000;
      if (dateFilter === 'YTD') {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
        return opDate >= startOfYear;
      }
      if (dateFilter === 'CUSTOM') {
        if (customStartDate && opDate < new Date(customStartDate).getTime()) return false;
        if (customEndDate && opDate > new Date(customEndDate).getTime() + 86400000) return false;
      }

      return true;
    });
  }, [cashOperations, accountFilter, dateFilter, customStartDate, customEndDate]);

  // Filtered open positions
  const filteredOpenPositions = useMemo(() => {
    return openPositions.filter((p) => {
      if (accountFilter !== 'ALL' && p.accountNumber && p.accountNumber !== accountFilter) {
        return false;
      }
      return true;
    });
  }, [openPositions, accountFilter]);

  // Summary
  const summary = useMemo(() => {
    return calculatePortfolioSummary(filteredTrades, filteredCashOperations, filteredOpenPositions);
  }, [filteredTrades, filteredCashOperations, filteredOpenPositions]);

  // Timelines
  const assetAllocation = useMemo(() => {
    return generateAssetAllocationTimeline(filteredTrades, filteredCashOperations, filteredOpenPositions);
  }, [filteredTrades, filteredCashOperations, filteredOpenPositions]);

  const cumulativePnL = useMemo(() => {
    return generateCumulativePnLTimeline(filteredTrades, filteredCashOperations);
  }, [filteredTrades, filteredCashOperations]);

  const benchmarkComparison = useMemo(() => {
    return generateBenchmarkComparison(filteredTrades, filteredCashOperations);
  }, [filteredTrades, filteredCashOperations]);

  // Export functions
  const exportPortfolioToJson = () => {
    const data = {
      accountNumbers,
      exportDate: new Date().toISOString(),
      trades,
      cashOperations,
      openPositions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `XTB_Unified_Portfolio_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTradesToCsv = () => {
    const headers = [
      'ID',
      'Numer Rachunku',
      'Instrument',
      'Ticker',
      'Kategoria',
      'Typ',
      'Wolumen',
      'Cena zakupu',
      'Cena sprzedaży',
      'Data otwarcia',
      'Data zamknięcia',
      'Zysk netto PLN',
      'Wartość zakupu PLN',
      'Wartość sprzedaży PLN',
      'Zwrot %',
    ];
    const rows = trades.map((t) => [
      t.id,
      t.accountNumber || '',
      `"${t.instrument}"`,
      t.ticker,
      t.category,
      t.type,
      t.volume,
      t.openPrice,
      t.closePrice,
      t.openTime,
      t.closeTime,
      t.profitNet,
      t.purchaseValue || '',
      t.saleValue || '',
      t.returnPercent?.toFixed(2) || '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `XTB_Wszystkie_Transakcje_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PortfolioContext.Provider
      value={{
        accountNumbers,
        accountFilter,
        setAccountFilter,
        trades,
        cashOperations,
        openPositions,
        filteredTrades,
        filteredCashOperations,
        summary,
        assetAllocation,
        cumulativePnL,
        benchmarkComparison,
        dateFilter,
        setDateFilter,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        categoryFilter,
        setCategoryFilter,
        privacyMode,
        togglePrivacyMode,
        formatMoney,
        theme,
        toggleTheme,
        importResult,
        setImportResult,
        addParsedData,
        loadDemoData,
        clearPortfolioData,
        deleteTrade,
        deleteCashOp,
        exportPortfolioToJson,
        exportTradesToCsv,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
