import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { usePortfolio } from '../../context/PortfolioContext';
import { TrendingUp } from 'lucide-react';

export const PnLChart: React.FC = () => {
  const { cumulativePnL, formatMoney, privacyMode, theme } = usePortfolio();
  const [chartMode, setChartMode] = useState<'COMBINED' | 'CUMULATIVE' | 'DAILY'>('COMBINED');

  if (!cumulativePnL || cumulativePnL.length === 0) {
    return (
      <div className="card-theme p-6 rounded-2xl flex flex-col items-center justify-center min-h-[340px] text-center text-slate-400">
        <TrendingUp className="w-10 h-10 mb-3 text-slate-400 dark:text-slate-600 animate-pulse" />
        <p className="font-semibold text-slate-700 dark:text-slate-300">Brak danych o zyskach i stratach</p>
        <p className="text-xs text-slate-500 mt-1">Wgraj zamknięte pozycje z XTB, aby zobaczyć wykres P&L.</p>
      </div>
    );
  }

  const formatDateTick = (tickStr: string) => {
    try {
      const d = new Date(tickStr);
      return d.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
    } catch {
      return tickStr;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.cumulativePnL >= 0;
      const isDailyPositive = data.dailyPnL >= 0;

      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-xl text-xs space-y-2 min-w-[190px]">
          <div className="font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex justify-between">
            <span>{label}</span>
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Skumulowany P&L:</span>
              <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isPositive ? '+' : ''}
                {formatMoney(data.cumulativePnL)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Wynik tego dnia:</span>
              <span className={`font-semibold ${isDailyPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isDailyPositive ? '+' : ''}
                {formatMoney(data.dailyPnL)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const refLineColor = isDark ? '#475569' : '#cbd5e1';

  return (
    <div className="card-theme p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Zyski i Straty w Czasie (P&L)
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-500/20">
              Skumulowany i Dzienny
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Krzywa narastającego zysku netto portfela oraz słupki pojedynczych realizacji zysków/strat.
          </p>
        </div>

        {/* Przełącznik widoku */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setChartMode('COMBINED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              chartMode === 'COMBINED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Razem
          </button>
          <button
            onClick={() => setChartMode('CUMULATIVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              chartMode === 'CUMULATIVE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tylko Krzywa
          </button>
          <button
            onClick={() => setChartMode('DAILY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              chartMode === 'DAILY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Słupki Dzienne
          </button>
        </div>
      </div>

      <div className="w-full h-[320px] sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={cumulativePnL} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.6} vertical={false} />
            <ReferenceLine y={0} stroke={refLineColor} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateTick}
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => (privacyMode ? '•••' : `${v} zł`)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const map: Record<string, string> = {
                  cumulativePnL: 'Skumulowany P&L (PLN)',
                  dailyPnL: 'Wynik Dnia (PLN)',
                };
                return <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{map[value] || value}</span>;
              }}
            />
            {(chartMode === 'COMBINED' || chartMode === 'DAILY') && (
              <Bar
                dataKey="dailyPnL"
                fill="#10b981"
                opacity={0.85}
                radius={[4, 4, 0, 0]}
              />
            )}
            {(chartMode === 'COMBINED' || chartMode === 'CUMULATIVE') && (
              <Line
                type="monotone"
                dataKey="cumulativePnL"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 3, fill: '#059669' }}
                activeDot={{ r: 6, fill: '#10b981' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
