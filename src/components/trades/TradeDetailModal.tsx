import React from 'react';
import { XtbTrade } from '../../types/portfolio';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
} from 'lucide-react';

interface TradeDetailModalProps {
  trade: XtbTrade | null;
  onClose: () => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({ trade, onClose }) => {
  const { formatMoney } = usePortfolio();

  if (!trade) return null;

  const isProfit = trade.profitNet >= 0;
  const returnPct = trade.returnPercent || 0;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                isProfit
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
              }`}
            >
              {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white font-mono">{trade.ticker}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {trade.category}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    trade.type === 'BUY'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'
                  }`}
                >
                  {trade.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{trade.instrument}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Profit Highlight */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isProfit
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300'
            }`}
          >
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-75">
                Zysk / Strata Netto
              </span>
              <div className="text-2xl font-bold font-mono">
                {isProfit ? '+' : ''}
                {formatMoney(trade.profitNet)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-75">
                Stopa Zwrotu %
              </span>
              <div className="text-2xl font-bold font-mono">
                {returnPct >= 0 ? '+' : ''}
                {returnPct.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Wolumen / Ilość</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono text-sm">{trade.volume} szt.</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Cena Otwarcia</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono text-sm">
                {trade.openPrice.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Cena Zamknięcia</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono text-sm">
                {trade.closePrice.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Wartość Zakupu</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono text-sm">
                {formatMoney(trade.purchaseValue)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Wartość Sprzedaży</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono text-sm">
                {formatMoney(trade.saleValue)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Czas trzymania pozycji</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono text-sm">
                {trade.durationDays ?? 0} dni
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Harmonogram Zlecenia
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Data Otwarcia:
                </span>
                <span>{formatDate(trade.openTime)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  Data Zamknięcia:
                </span>
                <span>{formatDate(trade.closeTime)}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/60 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
            {trade.accountNumber && (
              <div className="flex justify-between font-mono">
                <span>Rachunek XTB:</span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">#{trade.accountNumber}</span>
              </div>
            )}
            {trade.positionId && (
              <div className="flex justify-between font-mono">
                <span>ID Pozycji XTB:</span>
                <span className="text-slate-900 dark:text-slate-200">{trade.positionId}</span>
              </div>
            )}
            {trade.openConversionRate && (
              <div className="flex justify-between font-mono">
                <span>Kurs przewalutowania otwarcia:</span>
                <span className="text-slate-900 dark:text-slate-200">{trade.openConversionRate}</span>
              </div>
            )}
            {trade.closeConversionRate && (
              <div className="flex justify-between font-mono">
                <span>Kurs przewalutowania zamknięcia:</span>
                <span className="text-slate-900 dark:text-slate-200">{trade.closeConversionRate}</span>
              </div>
            )}
            {trade.swap !== undefined && trade.swap !== 0 && (
              <div className="flex justify-between font-mono">
                <span>Swap / Finansowanie:</span>
                <span className="text-amber-600 dark:text-amber-400">{formatMoney(trade.swap)}</span>
              </div>
            )}
            {trade.origin && (
              <div className="flex justify-between font-mono">
                <span>Źródło zlecenia:</span>
                <span className="text-slate-900 dark:text-slate-200">{trade.origin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
