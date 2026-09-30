import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { usePortfolio } from '../../context/PortfolioContext';
import { Layers } from 'lucide-react';

export const AssetAllocationChart: React.FC = () => {
  const { assetAllocation, formatMoney, privacyMode, theme } = usePortfolio();
  const [viewType, setViewType] = useState<'VALUES' | 'PERCENTAGE'>('VALUES');

  if (!assetAllocation || assetAllocation.length === 0) {
    return (
      <div className="card-theme p-6 rounded-2xl flex flex-col items-center justify-center min-h-[340px] text-center text-slate-400">
        <Layers className="w-10 h-10 mb-3 text-slate-400 dark:text-slate-600 animate-pulse" />
        <p className="font-semibold text-slate-700 dark:text-slate-300">Brak danych do wygenerowania struktury portfela</p>
        <p className="text-xs text-slate-500 mt-1">Wgraj raport XLSX z XTB, aby zobaczyć alokację aktywów w czasie.</p>
      </div>
    );
  }

  const chartData = assetAllocation.map((item) => {
    if (viewType === 'PERCENTAGE' && item.total > 0) {
      return {
        ...item,
        stocksPct: +((item.stocks / item.total) * 100).toFixed(1),
        etfsPct: +((item.etfs / item.total) * 100).toFixed(1),
        cfdCryptoPct: +((item.cfdCrypto / item.total) * 100).toFixed(1),
        cashPct: +((item.cash / item.total) * 100).toFixed(1),
      };
    }
    return item;
  });

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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-xl text-xs space-y-2 min-w-[200px]">
          <div className="font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              {formatMoney(data.total)}
            </span>
          </div>
          <div className="space-y-1 font-mono">
            <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
                Akcje (Stocks)
              </span>
              <span>{formatMoney(data.stocks)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                ETF-y
              </span>
              <span>{formatMoney(data.etfs)}</span>
            </div>
            {data.cfdCrypto > 0 && (
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                  CFD / Krypto
                </span>
                <span>{formatMoney(data.cfdCrypto)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-500"></span>
                Gotówka (Cash)
              </span>
              <span>{formatMoney(data.cash)}</span>
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

  return (
    <div className="card-theme p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Struktura Portfela w Czasie
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
              Historical Allocation
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Skumulowany wykres alokacji kapitału między akcje, ETF-y, CFD i gotówkę.
          </p>
        </div>

        {/* Przełącznik Wartości / Procenty */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setViewType('VALUES')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewType === 'VALUES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Wartość (PLN)
          </button>
          <button
            onClick={() => setViewType('PERCENTAGE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewType === 'PERCENTAGE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Udział (%)
          </button>
        </div>
      </div>

      <div className="w-full h-[320px] sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStocks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorEtfs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCfd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.6} vertical={false} />
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
              tickFormatter={(v) =>
                privacyMode ? '•••' : viewType === 'PERCENTAGE' ? `${v}%` : `${(v / 1000).toFixed(0)}k`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => {
                const map: Record<string, string> = {
                  stocks: 'Akcje',
                  etfs: 'ETF-y',
                  cfdCrypto: 'CFD / Krypto',
                  cash: 'Gotówka',
                  stocksPct: 'Akcje %',
                  etfsPct: 'ETF-y %',
                  cfdCryptoPct: 'CFD %',
                  cashPct: 'Gotówka %',
                };
                return <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{map[value] || value}</span>;
              }}
            />
            {viewType === 'VALUES' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="stocks"
                  stackId="1"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStocks)"
                />
                <Area
                  type="monotone"
                  dataKey="etfs"
                  stackId="1"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEtfs)"
                />
                <Area
                  type="monotone"
                  dataKey="cfdCrypto"
                  stackId="1"
                  stroke="#d97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCfd)"
                />
                <Area
                  type="monotone"
                  dataKey="cash"
                  stackId="1"
                  stroke="#64748b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCash)"
                />
              </>
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="stocksPct"
                  stackId="1"
                  stroke="#4f46e5"
                  fill="#6366f1"
                />
                <Area
                  type="monotone"
                  dataKey="etfsPct"
                  stackId="1"
                  stroke="#059669"
                  fill="#10b981"
                />
                <Area
                  type="monotone"
                  dataKey="cfdCryptoPct"
                  stackId="1"
                  stroke="#d97706"
                  fill="#f59e0b"
                />
                <Area
                  type="monotone"
                  dataKey="cashPct"
                  stackId="1"
                  stroke="#64748b"
                  fill="#64748b"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
