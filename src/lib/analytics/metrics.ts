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

  for (const op of cashOps) {
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

  const totalTradesCount = trades.length;
  const winRate = totalTradesCount > 0 ? (winningTradesCount / totalTradesCount) * 100 : 0;
  const profitFactor = totalProfitLosses > 0 ? totalProfitGains / totalProfitLosses : totalProfitGains > 0 ? 999 : 0;
  const avgTradeProfit = totalTradesCount > 0 ? totalRealizedProfit / totalTradesCount : 0;
  const avgHoldingDays = totalTradesCount > 0 ? Math.round(totalHoldingDays / totalTradesCount) : 0;

  // Total open position value
  const totalOpenPositionValue = openPositions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalUnrealizedProfit = openPositions.reduce((sum, p) => sum + p.unrealizedProfit, 0);

  // Approximate cash remaining = netDeposit + totalRealizedProfit + totalDividendsNet + totalInterest - totalTaxPaid - totalFees - openPositionsPurchaseValue
  const totalOpenPurchaseValue = openPositions.reduce((sum, p) => sum + p.purchaseValue, 0);
  const estimatedCash = Math.max(
    0,
    netDeposit + totalRealizedProfit + totalDividendsNet + totalInterest - totalTaxPaid - totalFees - totalOpenPurchaseValue
  );

  const portfolioValue = totalOpenPositionValue + estimatedCash;
  const totalReturnAmount = totalRealizedProfit + totalUnrealizedProfit + totalDividendsNet + totalInterest - totalFees;
  const totalReturnPercentage = netDeposit > 0 ? (totalReturnAmount / netDeposit) * 100 : 0;

  return {
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
  // Collect all events with dates
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

  // Sort by time
  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  if (events.length === 0) return [];

  // Group by date
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
  // Collect all unique dates from operations and trades
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

    // Cash operations up to date
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

    // Active trades at that date
    for (const t of trades) {
      const openTime = new Date(t.openTime).getTime();
      const closeTime = new Date(t.closeTime).getTime();

      if (openTime <= targetDate && closeTime > targetDate) {
        // Trade was open on this date
        const val = t.purchaseValue || (t.openPrice * t.volume);
        cash -= val;
        if (t.category === 'STOCK') stocksVal += val;
        else if (t.category === 'ETF') etfsVal += val;
        else cfdVal += val;
      } else if (closeTime <= targetDate) {
        // Trade closed: profit added to cash
        cash += (t.profitNet || 0);
      }
    }

    // Open positions for today
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

/**
 * PIT-38 Polish Tax Helper calculations
 */
export interface Pit38Summary {
  year: number;
  // Sekcja C - Odpłatne zbycie papierów wartościowych (art. 30b ust. 2)
  revenueSectionC: number;        // Przychód (Wartość sprzedaży)
  costsSectionC: number;          // Koszty uzyskania przychodów (Wartość zakupu + prowizje)
  incomeSectionC: number;         // Dochód (jeśli > 0)
  lossSectionC: number;           // Strata (jeśli < 0)
  taxDueSectionC: number;         // Należny podatek 19%
  tradesCount: number;

  // Sekcja G - Zryczałtowany podatek od dywidend zagranicznych (art. 30b ust. 5a)
  foreignDividendsGross: number;  // Dywidendy brutto
  taxPaidAbroad: number;          // Podatek zapłacony za granicą (np. 15% US/NL)
  taxDue19PctPoland: number;      // 19% zryczałtowany podatek w PL
  additionalTaxToPayPL: number;   // Doplata do 19% w Polsce (np. 4% przy stawce 15%)

  // Odsetki od wolnych środków
  interestGross: number;
  interestTaxPaid: number;
}

export function calculateTaxSummaryPIT38(
  trades: XtbTrade[],
  cashOps: XtbCashOperation[],
  targetYear: number
): Pit38Summary {
  let revenueSectionC = 0;
  let costsSectionC = 0;
  let tradesCount = 0;

  for (const t of trades) {
    const closeYear = new Date(t.closeTime).getFullYear();
    if (closeYear === targetYear) {
      tradesCount++;
      const sale = t.saleValue || (t.closePrice * t.volume);
      const buy = t.purchaseValue || (t.openPrice * t.volume);
      revenueSectionC += sale;
      costsSectionC += buy + (t.commission || 0) + Math.abs(t.swap || 0);
    }
  }

  const netIncome = revenueSectionC - costsSectionC;
  const incomeSectionC = netIncome > 0 ? netIncome : 0;
  const lossSectionC = netIncome < 0 ? Math.abs(netIncome) : 0;
  const taxDueSectionC = +(incomeSectionC * 0.19).toFixed(2);

  // Foreign dividends and interest in year
  let foreignDividendsNet = 0;
  let taxPaidAbroad = 0;
  let interestGross = 0;

  for (const op of cashOps) {
    const opYear = new Date(op.time).getFullYear();
    if (opYear === targetYear) {
      if (op.type === 'DIVIDEND') {
        foreignDividendsNet += op.amount;
      } else if (op.type === 'TAX') {
        taxPaidAbroad += Math.abs(op.amount);
      } else if (op.type === 'INTEREST') {
        interestGross += op.amount;
      }
    }
  }

  const foreignDividendsGross = foreignDividendsNet + taxPaidAbroad;
  const taxDue19PctPoland = +(foreignDividendsGross * 0.19).toFixed(2);
  const additionalTaxToPayPL = Math.max(0, +(taxDue19PctPoland - taxPaidAbroad).toFixed(2));
  const interestTaxPaid = +(interestGross * 0.19).toFixed(2);

  return {
    year: targetYear,
    revenueSectionC: +revenueSectionC.toFixed(2),
    costsSectionC: +costsSectionC.toFixed(2),
    incomeSectionC: +incomeSectionC.toFixed(2),
    lossSectionC: +lossSectionC.toFixed(2),
    taxDueSectionC,
    tradesCount,
    foreignDividendsGross: +foreignDividendsGross.toFixed(2),
    taxPaidAbroad: +taxPaidAbroad.toFixed(2),
    taxDue19PctPoland,
    additionalTaxToPayPL,
    interestGross: +interestGross.toFixed(2),
    interestTaxPaid,
  };
}
