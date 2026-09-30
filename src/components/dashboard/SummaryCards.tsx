import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
  Receipt,
  Percent,
  PiggyBank,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

export const SummaryCards: React.FC = () => {
  const { summary, formatMoney } = usePortfolio();

  const isProfit = summary.totalReturnAmount >= 0;
  const isRealizedProfit = summary.totalRealizedProfit >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Karta 1: Wartość Portfela */}
      <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/80 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            Wartość Portfela
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-medium border border-emerald-500/20">
            Szacowana
          </span>
        </div>
        <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-mono">
          {formatMoney(summary.portfolioValue)}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Wpłaty netto:</span>
          <span className="font-semibold text-slate-200 font-mono">
            {formatMoney(summary.netDeposit)}
          </span>
        </div>
      </div>

      {/* Karta 2: Całkowity Wynik Portfela */}
      <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/80 shadow-xl relative overflow-hidden group">
        <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 ${isProfit ? 'bg-emerald-500/15' : 'bg-rose-500/15'} rounded-full blur-2xl transition-all duration-500`}></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            {isProfit ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
            Łączny Zysk / Strata
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 border ${
              isProfit
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {isProfit ? '+' : ''}
            {summary.totalReturnPercentage.toFixed(2)}%
          </span>
        </div>
        <div
          className={`text-2xl lg:text-3xl font-bold tracking-tight font-mono ${
            isProfit ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isProfit ? '+' : ''}
          {formatMoney(summary.totalReturnAmount)}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Zysk zrealizowany:</span>
          <span
            className={`font-semibold font-mono ${
              isRealizedProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isRealizedProfit ? '+' : ''}
            {formatMoney(summary.totalRealizedProfit)}
          </span>
        </div>
      </div>

      {/* Karta 3: Pasywny Dochód (Dywidendy & Odsetki) */}
      <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/80 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            Dywidendy & Odsetki
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono font-medium border border-amber-500/20">
            Netto
          </span>
        </div>
        <div className="text-2xl lg:text-3xl font-bold text-amber-300 tracking-tight font-mono">
          +{formatMoney(summary.totalDividendsNet + summary.totalInterest)}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Dywidendy:</span>
          <span className="font-semibold text-slate-200 font-mono">
            {formatMoney(summary.totalDividendsNet)}
          </span>
          <span className="text-slate-600">|</span>
          <span>Odsetki:</span>
          <span className="font-semibold text-slate-200 font-mono">
            {formatMoney(summary.totalInterest)}
          </span>
        </div>
      </div>

      {/* Karta 4: Skuteczność & Statystyki Tradingu */}
      <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/80 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-blue-400" />
            Skuteczność (Win Rate)
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono font-medium border border-blue-500/20">
            {summary.totalTradesCount} transakcji
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold text-blue-400 tracking-tight font-mono">
            {summary.winRate.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400 font-mono">
            PF: <strong className="text-slate-200">{summary.profitFactor >= 99 ? '∞' : summary.profitFactor.toFixed(2)}</strong>
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {summary.winningTradesCount} zysków
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-rose-400 font-mono">
            {summary.losingTradesCount} strat
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-300 font-mono">
            <Calendar className="w-3 h-3 text-slate-400" />
            śr. {summary.avgHoldingDays} dni
          </span>
        </div>
      </div>
    </div>
  );
};
