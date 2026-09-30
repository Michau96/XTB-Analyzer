import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { usePortfolio } from '../../context/PortfolioContext';
import { Award } from 'lucide-react';

export const BenchmarkChart: React.FC = () => {
  const { benchmarkComparison, theme } = usePortfolio();
  const [showSp500, setShowSp500] = useState(true);
  const [showMsciAcwi, setShowMsciAcwi] = useState(true);
  const [showWig20, setShowWig20] = useState(true);

  if (!benchmarkComparison || benchmarkComparison.length === 0) {
    return (
      <div className="card-theme p-6 rounded-2xl flex flex-col items-center justify-center min-h-[340px] text-center text-slate-400">
        <Award className="w-10 h-10 mb-3 text-slate-400 dark:text-slate-600 animate-pulse" />
        <p className="font-semibold text-slate-700 dark:text-slate-300">Brak danych do benchmarkingu</p>
        <p className="text-xs text-slate-500 mt-1">
          Wgraj transakcje, aby porównać stopę zwrotu z indeksem S&P 500 oraz MSCI ACWI.
        </p>
      </div>
    );
  }

  const lastPoint = benchmarkComparison[benchmarkComparison.length - 1];
  const portReturn = lastPoint?.portfolioReturn || 0;
  const sp500Return = lastPoint?.sp500Return || 0;
  const acwiReturn = lastPoint?.msciAcwiReturn || 0;
  const wig20Return = lastPoint?.wig20Return || 0;

  const alphaVsSp500 = portReturn - sp500Return;
  const alphaVsAcwi = portReturn - acwiReturn;

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
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-xl text-xs space-y-2 min-w-[210px]">
          <div className="font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Stopa zwrotu od początku</span>
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Twój Portfel XTB:
              </span>
              <span>{data.portfolioReturn >= 0 ? '+' : ''}{data.portfolioReturn}%</span>
            </div>
            {showSp500 && (
              <div className="flex items-center justify-between text-sky-700 dark:text-sky-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  S&P 500 (SPY/VOO):
                </span>
                <span>{data.sp500Return >= 0 ? '+' : ''}{data.sp500Return}%</span>
              </div>
            )}
            {showMsciAcwi && (
              <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  MSCI ACWI (Świat):
                </span>
                <span>{data.msciAcwiReturn >= 0 ? '+' : ''}{data.msciAcwiReturn}%</span>
              </div>
            )}
            {showWig20 && (
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  WIG20 TR (GPW):
                </span>
                <span>{data.wig20Return >= 0 ? '+' : ''}{data.wig20Return}%</span>
              </div>
            )}
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
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Benchmarking: Portfel vs Rynek
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium border border-indigo-200 dark:border-indigo-500/20">
              TWR & Porównanie %
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Porównanie znormalizowanej stopy zwrotu Twojego portfela z indeksami światowymi.
          </p>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSp500(!showSp500)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              showSp500
                ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40'
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            S&P 500
          </button>
          <button
            onClick={() => setShowMsciAcwi(!showMsciAcwi)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              showMsciAcwi
                ? 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40'
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            MSCI ACWI
          </button>
          <button
            onClick={() => setShowWig20(!showWig20)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              showWig20
                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            WIG20 TR
          </button>
        </div>
      </div>

      {/* Mini badge z wynikiem Alfa */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Twój Portfel</span>
          <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {portReturn >= 0 ? '+' : ''}{portReturn.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">S&P 500</span>
          <div className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">
            {sp500Return >= 0 ? '+' : ''}{sp500Return.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Alfa vs S&P 500</span>
          <div className={`text-sm font-bold font-mono ${alphaVsSp500 >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {alphaVsSp500 >= 0 ? '+' : ''}{alphaVsSp500.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Alfa vs ACWI</span>
          <div className={`text-sm font-bold font-mono ${alphaVsAcwi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {alphaVsAcwi >= 0 ? '+' : ''}{alphaVsAcwi.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={benchmarkComparison} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="portfolioReturn"
              name="Twój Portfel"
              stroke="#059669"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#10b981' }}
            />
            {showSp500 && (
              <Line
                type="monotone"
                dataKey="sp500Return"
                name="S&P 500"
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
            {showMsciAcwi && (
              <Line
                type="monotone"
                dataKey="msciAcwiReturn"
                name="MSCI ACWI"
                stroke="#9333ea"
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={false}
              />
            )}
            {showWig20 && (
              <Line
                type="monotone"
                dataKey="wig20Return"
                name="WIG20 TR"
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
