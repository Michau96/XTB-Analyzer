export interface BenchmarkPoint {
  date: string;
  sp500: number;    // cumulative % return from baseline
  msciAcwi: number; // cumulative % return from baseline
  wig20: number;    // cumulative % return from baseline
}

/**
 * Generates synthetic realistic daily benchmark series for date range
 * with realistic macroeconomic trends for 2024-2026.
 */
export function getBenchmarkReturn(ticker: 'SP500' | 'MSCI_ACWI' | 'WIG20', dateStr: string, baseDateStr: string): number {
  const d = new Date(dateStr).getTime();
  const baseD = new Date(baseDateStr).getTime();
  const diffDays = (d - baseD) / (1000 * 60 * 60 * 24);

  if (diffDays <= 0) return 0;

  // Annualized approximate returns with realistic volatility
  // S&P 500: ~18% p.a. in 2025-2026 bull market with AI boost
  // MSCI ACWI: ~14% p.a.
  // WIG20: ~22% p.a. (Polish market boom)
  const annualRate = ticker === 'SP500' ? 0.18 : ticker === 'WIG20' ? 0.22 : 0.14;
  const years = diffDays / 365;

  // Pseudo-random deterministic sine waves to recreate realistic market dips and rallies
  const dayIndex = Math.floor(diffDays);
  const wave1 = Math.sin(dayIndex / 25) * 3.5;
  const wave2 = Math.cos(dayIndex / 60) * 4.2;
  const wave3 = Math.sin(dayIndex / 12) * 1.8;
  const volatility = wave1 + wave2 + wave3;

  const baseReturn = (Math.pow(1 + annualRate, years) - 1) * 100;
  return +(baseReturn + volatility).toFixed(2);
}
