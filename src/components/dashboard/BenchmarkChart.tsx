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
import { Award, Compass, TrendingUp, HelpCircle } from 'lucide-react';

export const BenchmarkChart: React.FC = () => {
  const { benchmarkComparison, summary } = usePortfolio();
  const [showSp500, setShowSp500] = useState(true);
  const [showMsciAcwi, setShowMsciAcwi] = useState(true);
  const [showWig20, setShowWig20] = useState(true);

  if (!benchmarkComparison || benchmarkComparison.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[340px] text-center text-slate-400">
        <Award className="w-10 h-10 mb-3 text-slate-600 animate-pulse" />
        <p className="font-medium text-slate-300">Brak danych do benchmarkingu</p>
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
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 min-w-[210px]">
          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400">Stopa zwrotu od początku</span>
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Twój Portfel XTB:
              </span>
              <span>{data.portfolioReturn >= 0 ? '+' : ''}{data.portfolioReturn}%</span>
            </div>
            {showSp500 && (
              <div className="flex items-center justify-between text-sky-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                  S&P 500 (SPY/VOO):
                </span>
                <span>{data.sp500Return >= 0 ? '+' : ''}{data.sp500Return}%</span>
              </div>
            )}
            {showMsciAcwi && (
              <div className="flex items-center justify-between text-purple-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                  MSCI ACWI (Świat):
                </span>
                <span>{data.msciAcwiReturn >= 0 ? '+' : ''}{data.msciAcwiReturn}%</span>
              </div>
            )}
            {showWig20 && (
              <div className="flex items-center justify-between text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
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

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              Benchmarking: Portfel vs Rynek
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
              TWR & Porównanie %
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Porównanie znormalizowanej stopy zwrotu Twojego portfela z kluczowymi indeksami światowymi.
          </p>
        </div>

        {/* Toggles dla benchmarków */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSp500(!showSp500)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              showSp500
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            S&P 500
          </button>
          <button
            onClick={() => setShowMsciAcwi(!showMsciAcwi)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              showMsciAcwi
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            MSCI ACWI
          </button>
          <button
            onClick={() => setShowWig20(!showWig20)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              showWig20
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            WIG20 TR
          </button>
        </div>
      </div>

      {/* Mini badge z wynikiem Alfa */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">Twój Portfel</span>
          <div className="text-sm font-bold font-mono text-emerald-400">
            {portReturn >= 0 ? '+' : ''}{portReturn.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">S&P 500</span>
          <div className="text-sm font-bold font-mono text-sky-400">
            {sp500Return >= 0 ? '+' : ''}{sp500Return.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">Alfa vs S&P 500</span>
          <div className={`text-sm font-bold font-mono ${alphaVsSp500 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {alphaVsSp500 >= 0 ? '+' : ''}{alphaVsSp500.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">Alfa vs ACWI</span>
          <div className={`text-sm font-bold font-mono ${alphaVsAcwi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {alphaVsAcwi >= 0 ? '+' : ''}{alphaVsAcwi.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={benchmarkComparison} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateTick}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="portfolioReturn"
              name="Twój Portfel"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#34d399' }}
            />
            {showSp500 && (
              <Line
                type="monotone"
                dataKey="sp500Return"
                name="S&P 500"
                stroke="#38bdf8"
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
                stroke="#c084fc"
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
                stroke="#fbbf24"
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
