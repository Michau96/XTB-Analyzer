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
import { Layers, PieChart as PieIcon, Info } from 'lucide-react';

export const AssetAllocationChart: React.FC = () => {
  const { assetAllocation, formatMoney, privacyMode } = usePortfolio();
  const [viewType, setViewType] = useState<'VALUES' | 'PERCENTAGE'>('VALUES');

  if (!assetAllocation || assetAllocation.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[340px] text-center text-slate-400">
        <Layers className="w-10 h-10 mb-3 text-slate-600 animate-pulse" />
        <p className="font-medium text-slate-300">Brak danych do wygenerowania struktury portfela</p>
        <p className="text-xs text-slate-500 mt-1">Wgraj raport XLSX z XTB, aby zobaczyć alokację aktywów w czasie.</p>
      </div>
    );
  }

  // Format data for percentage view if selected
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
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 min-w-[200px]">
          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-emerald-400 font-mono font-bold">
              {formatMoney(data.total)}
            </span>
          </div>
          <div className="space-y-1 font-mono">
            <div className="flex items-center justify-between text-indigo-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
                Akcje (Stocks)
              </span>
              <span>{formatMoney(data.stocks)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                ETF-y
              </span>
              <span>{formatMoney(data.etfs)}</span>
            </div>
            {data.cfdCrypto > 0 && (
              <div className="flex items-center justify-between text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                  CFD / Krypto
                </span>
                <span>{formatMoney(data.cfdCrypto)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-400">
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

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Struktura Portfela w Czasie
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
              Historical Allocation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Skumulowany wykres alokacji kapitału między akcje, fundusze ETF, instrumenty CFD i gotówkę.
          </p>
        </div>

        {/* Przełącznik Wartości / Procenty */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewType('VALUES')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewType === 'VALUES'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wartość (PLN)
          </button>
          <button
            onClick={() => setViewType('PERCENTAGE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewType === 'PERCENTAGE'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
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
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
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
                return <span className="text-xs text-slate-300 font-medium">{map[value] || value}</span>;
              }}
            />
            {viewType === 'VALUES' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="stocks"
                  stackId="1"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStocks)"
                />
                <Area
                  type="monotone"
                  dataKey="etfs"
                  stackId="1"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEtfs)"
                />
                <Area
                  type="monotone"
                  dataKey="cfdCrypto"
                  stackId="1"
                  stroke="#f59e0b"
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
                  stroke="#6366f1"
                  fill="#6366f1"
                />
                <Area
                  type="monotone"
                  dataKey="etfsPct"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                />
                <Area
                  type="monotone"
                  dataKey="cfdCryptoPct"
                  stackId="1"
                  stroke="#f59e0b"
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
