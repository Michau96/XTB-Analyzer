import {
  AssetAllocationPoint,
  BenchmarkComparisonPoint,
  CumulativePnLPoint,
  PortfolioSummary,
  XtbCashOperation,
  XtbOpenPosition,
  XtbTrade,
} from '../../types/portfolio';
import { getBenchmarkReturn } from '../data/benchmarks';

export function calculatePortfolioSummary(
  trades: XtbTrade[],
  cashOps: XtbCashOperation[],
  openPositions: XtbOpenPosition[] = []
): PortfolioSummary {
  let totalDeposit = 0;
  let totalWithdrawal = 0;
  let totalDividendsNet = 0;
  let totalTaxPaid = 0;
  let totalInterest = 0;
  let totalFees = 0;

  const accountNumbersSet = new Set<string>();

  for (const op of cashOps) {
    if (op.accountNumber) accountNumbersSet.add(op.accountNumber);
    if (op.type === 'DEPOSIT') {
      totalDeposit += Math.abs(op.amount);
    } else if (op.type === 'WITHDRAWAL') {
      totalWithdrawal += Math.abs(op.amount);
    } else if (op.type === 'DIVIDEND') {
      totalDividendsNet += op.amount;
    } else if (op.type === 'TAX') {
      totalTaxPaid += Math.abs(op.amount);
    } else if (op.type === 'INTEREST') {
      totalInterest += op.amount;
    } else if (op.type === 'FEE') {
      totalFees += Math.abs(op.amount);
    }
  }

  const netDeposit = totalDeposit - totalWithdrawal;

  let totalRealizedProfit = 0;
  let winningTradesCount = 0;
  let losingTradesCount = 0;
  let totalProfitGains = 0;
  let totalProfitLosses = 0;
  let totalHoldingDays = 0;
  let bestTrade: { ticker: string; profit: number; percent: number } | null = null;
  let worstTrade: { ticker: string; profit: number; percent: number } | null = null;

  for (const t of trades) {
    if (t.accountNumber) accountNumbersSet.add(t.accountNumber);
    totalRealizedProfit += t.profitNet;
    totalHoldingDays += t.durationDays || 0;

    if (t.profitNet > 0) {
      winningTradesCount++;
      totalProfitGains += t.profitNet;
    } else if (t.profitNet < 0) {
      losingTradesCount++;
      totalProfitLosses += Math.abs(t.profitNet);
    }

    const retPct = t.returnPercent || 0;
    if (!bestTrade || t.profitNet > bestTrade.profit) {
      bestTrade = { ticker: t.ticker, profit: t.profitNet, percent: retPct };
    }
    if (!worstTrade || t.profitNet < worstTrade.profit) {
      worstTrade = { ticker: t.ticker, profit: t.profitNet, percent: retPct };
    }
  }

  for (const op of openPositions) {
    if (op.accountNumber) accountNumbersSet.add(op.accountNumber);
  }

  const totalTradesCount = trades.length;
  const winRate = totalTradesCount > 0 ? (winningTradesCount / totalTradesCount) * 100 : 0;
  const profitFactor = totalProfitLosses > 0 ? totalProfitGains / totalProfitLosses : totalProfitGains > 0 ? 999 : 0;
  const avgTradeProfit = totalTradesCount > 0 ? totalRealizedProfit / totalTradesCount : 0;
  const avgHoldingDays = totalTradesCount > 0 ? Math.round(totalHoldingDays / totalTradesCount) : 0;

  // Total open position value
  const totalOpenPositionValue = openPositions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalUnrealizedProfit = openPositions.reduce((sum, p) => sum + p.unrealizedProfit, 0);

  // Approximate cash remaining
  const totalOpenPurchaseValue = openPositions.reduce((sum, p) => sum + p.purchaseValue, 0);
  const estimatedCash = Math.max(
    0,
    netDeposit + totalRealizedProfit + totalDividendsNet + totalInterest - totalTaxPaid - totalFees - totalOpenPurchaseValue
  );

  const portfolioValue = totalOpenPositionValue + estimatedCash;
  const totalReturnAmount = totalRealizedProfit + totalUnrealizedProfit + totalDividendsNet + totalInterest - totalFees;
  const totalReturnPercentage = netDeposit > 0 ? (totalReturnAmount / netDeposit) * 100 : 0;

  return {
    accountNumbers: Array.from(accountNumbersSet),
    totalDeposit,
    totalWithdrawal,
    netDeposit,
    totalRealizedProfit,
    totalDividendsNet,
    totalDividendsGross: totalDividendsNet + totalTaxPaid,
    totalTaxPaid,
    totalInterest,
    totalFees,
    portfolioValue,
    totalReturnAmount,
    totalReturnPercentage,
    winRate,
    profitFactor,
    totalTradesCount,
    winningTradesCount,
    losingTradesCount,
    avgTradeProfit,
    avgHoldingDays,
    bestTrade,
    worstTrade,
  };
}

/**
 * Builds time series of cumulative P&L and daily P&L
 */
export function generateCumulativePnLTimeline(
  trades: XtbTrade[],
  cashOps: XtbCashOperation[]
): CumulativePnLPoint[] {
  const events: { date: string; time: string; pnlDelta: number; cashDelta: number }[] = [];

  for (const t of trades) {
    const dStr = t.closeTime.slice(0, 10);
    events.push({
      date: dStr,
      time: t.closeTime,
      pnlDelta: t.profitNet,
      cashDelta: t.profitNet,
    });
  }

  for (const op of cashOps) {
    const dStr = op.time.slice(0, 10);
    if (op.type === 'DIVIDEND' || op.type === 'INTEREST') {
      events.push({
        date: dStr,
        time: op.time,
        pnlDelta: op.amount,
        cashDelta: op.amount,
      });
    } else if (op.type === 'DEPOSIT') {
      events.push({
        date: dStr,
        time: op.time,
        pnlDelta: 0,
        cashDelta: op.amount,
      });
    } else if (op.type === 'WITHDRAWAL') {
      events.push({
        date: dStr,
        time: op.time,
        pnlDelta: 0,
        cashDelta: -Math.abs(op.amount),
      });
    } else if (op.type === 'TAX' || op.type === 'FEE') {
      events.push({
        date: dStr,
        time: op.time,
        pnlDelta: -Math.abs(op.amount),
        cashDelta: -Math.abs(op.amount),
      });
    }
  }

  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  if (events.length === 0) return [];

  const dateMap = new Map<string, { pnl: number; cash: number }>();
  for (const e of events) {
    const curr = dateMap.get(e.date) || { pnl: 0, cash: 0 };
    curr.pnl += e.pnlDelta;
    curr.cash += e.cashDelta;
    dateMap.set(e.date, curr);
  }

  const result: CumulativePnLPoint[] = [];
  let cumPnL = 0;
  let cumVal = 0;

  const sortedDates = Array.from(dateMap.keys()).sort();

  for (const d of sortedDates) {
    const data = dateMap.get(d)!;
    cumPnL += data.pnl;
    cumVal += data.cash;
    result.push({
      date: d,
      timestamp: new Date(d).getTime(),
      cumulativePnL: +cumPnL.toFixed(2),
      dailyPnL: +data.pnl.toFixed(2),
      portfolioValue: +Math.max(0, cumVal).toFixed(2),
    });
  }

  return result;
}

/**
 * Builds Historical Asset Allocation Stacked Timeline (Stocks, ETFs, CFD/Crypto, Cash)
 */
export function generateAssetAllocationTimeline(
  trades: XtbTrade[],
  cashOps: XtbCashOperation[],
  openPositions: XtbOpenPosition[] = []
): AssetAllocationPoint[] {
  const dateSet = new Set<string>();

  for (const t of trades) {
    dateSet.add(t.openTime.slice(0, 10));
    dateSet.add(t.closeTime.slice(0, 10));
  }
  for (const op of cashOps) {
    dateSet.add(op.time.slice(0, 10));
  }

  const sortedDates = Array.from(dateSet).sort();
  if (sortedDates.length === 0) return [];

  const points: AssetAllocationPoint[] = [];

  for (const d of sortedDates) {
    const targetDate = new Date(d + 'T23:59:59.999Z').getTime();

    let cash = 0;
    for (const op of cashOps) {
      if (new Date(op.time).getTime() <= targetDate) {
        if (op.type === 'DEPOSIT') cash += Math.abs(op.amount);
        else if (op.type === 'WITHDRAWAL') cash -= Math.abs(op.amount);
        else if (op.type === 'DIVIDEND' || op.type === 'INTEREST') cash += op.amount;
        else if (op.type === 'TAX' || op.type === 'FEE') cash -= Math.abs(op.amount);
      }
    }

    let stocksVal = 0;
    let etfsVal = 0;
    let cfdVal = 0;

    for (const t of trades) {
      const openTime = new Date(t.openTime).getTime();
      const closeTime = new Date(t.closeTime).getTime();

      if (openTime <= targetDate && closeTime > targetDate) {
        const val = t.purchaseValue || (t.openPrice * t.volume);
        cash -= val;
        if (t.category === 'STOCK') stocksVal += val;
        else if (t.category === 'ETF') etfsVal += val;
        else cfdVal += val;
      } else if (closeTime <= targetDate) {
        cash += (t.profitNet || 0);
      }
    }

    for (const op of openPositions) {
      const openTime = new Date(op.openTime).getTime();
      if (openTime <= targetDate) {
        const val = op.currentValue || (op.currentPrice * op.volume);
        cash -= op.purchaseValue;
        if (op.category === 'STOCK') stocksVal += val;
        else if (op.category === 'ETF') etfsVal += val;
        else cfdVal += val;
      }
    }

    const safeCash = Math.max(0, cash);
    const total = stocksVal + etfsVal + cfdVal + safeCash;

    points.push({
      date: d,
      timestamp: targetDate,
      stocks: +stocksVal.toFixed(2),
      etfs: +etfsVal.toFixed(2),
      cfdCrypto: +cfdVal.toFixed(2),
      cash: +safeCash.toFixed(2),
      total: +total.toFixed(2),
    });
  }

  return points;
}

/**
 * Builds Benchmark Comparison Time Series (% return of Portfolio vs S&P 500 vs MSCI ACWI vs WIG20)
 */
export function generateBenchmarkComparison(
  trades: XtbTrade[],
  cashOps: XtbCashOperation[]
): BenchmarkComparisonPoint[] {
  const pnlTimeline = generateCumulativePnLTimeline(trades, cashOps);
  if (pnlTimeline.length < 2) return [];

  const baseDate = pnlTimeline[0].date;
  const initialCapital = Math.max(1000, pnlTimeline[0].portfolioValue || 5000);

  return pnlTimeline.map((pt) => {
    const portfolioReturn = (pt.cumulativePnL / initialCapital) * 100;
    const sp500Return = getBenchmarkReturn('SP500', pt.date, baseDate);
    const msciAcwiReturn = getBenchmarkReturn('MSCI_ACWI', pt.date, baseDate);
    const wig20Return = getBenchmarkReturn('WIG20', pt.date, baseDate);

    return {
      date: pt.date,
      portfolioReturn: +portfolioReturn.toFixed(2),
      sp500Return,
      msciAcwiReturn,
      wig20Return,
    };
  });
}
