import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePortfolio } from '../../context/PortfolioContext';
import { PieChart as PieIcon, ArrowUpRight, ShieldCheck } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const AssetDonutChart: React.FC = () => {
  const { trades, openPositions, formatMoney, privacyMode } = usePortfolio();

  // Aggregate by ticker
  const tickerMap = new Map<string, { ticker: string; instrument: string; category: string; value: number }>();

  // Aggregate from closed trades or open positions
  for (const pos of openPositions) {
    const val = pos.currentValue || (pos.currentPrice * pos.volume);
    tickerMap.set(pos.ticker, {
      ticker: pos.ticker,
      instrument: pos.instrument,
      category: pos.category,
      value: val,
    });
  }

  // If no open positions, show distribution of top closed trades
  if (tickerMap.size === 0) {
    for (const t of trades) {
      const val = t.saleValue || (t.closePrice * t.volume);
      const curr = tickerMap.get(t.ticker) || {
        ticker: t.ticker,
        instrument: t.instrument,
        category: t.category,
        value: 0,
      };
      curr.value += val;
      tickerMap.set(t.ticker, curr);
    }
  }

  const holdings = Array.from(tickerMap.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  const pieData = holdings.map((h) => ({
    name: h.ticker,
    instrument: h.instrument,
    value: +h.value.toFixed(2),
    pct: totalValue > 0 ? +((h.value / totalValue) * 100).toFixed(1) : 0,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <div className="font-bold text-slate-200">{data.name}</div>
          <div className="text-slate-400">{data.instrument}</div>
          <div className="font-mono text-emerald-400 font-bold">
            {formatMoney(data.value)} ({data.pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-purple-400" />
            Top Pozycje w Portfelu
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Koncentracja i alokacja najważniejszych spółek i funduszy
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 font-medium border border-purple-500/20">
          {holdings.length} aktywów
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 h-[200px] sm:h-[220px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Suma Top</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {formatMoney(totalValue, 'PLN', 0)}
            </span>
          </div>
        </div>

        <div className="md:col-span-7 space-y-2.5">
          {holdings.map((item, idx) => {
            const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            return (
              <div
                key={item.ticker}
                className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  <div className="truncate">
                    <div className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                      {item.ticker}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{item.instrument}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-mono">
                  <div className="font-semibold text-slate-200">{formatMoney(item.value)}</div>
                  <div className="text-[11px] text-purple-400 font-medium">{pct.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
