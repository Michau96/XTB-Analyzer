import React, { useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Coins, Receipt, TrendingUp, Calendar, Building2 } from 'lucide-react';

export const DividendCenter: React.FC = () => {
  const { cashOperations, formatMoney, privacyMode, theme } = usePortfolio();

  const { dividendOps, taxOps, totalGross, totalNet, totalTax, monthlyData, tickerBreakdown } =
    useMemo(() => {
      const divs = cashOperations.filter((o) => o.type === 'DIVIDEND');
      const taxes = cashOperations.filter((o) => o.type === 'TAX');

      let netSum = 0;
      let taxSum = 0;

      const monthlyMap = new Map<string, number>();
      const tickerMap = new Map<string, { ticker: string; net: number; count: number }>();

      for (const d of divs) {
        netSum += d.amount;
        const monthKey = d.time.slice(0, 7);
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + d.amount);

        const match = (d.comment || d.typeRaw).match(/([A-Z0-9.]{2,8})/);
        const ticker = match ? match[1] : 'Inne';

        const curr = tickerMap.get(ticker) || { ticker, net: 0, count: 0 };
        curr.net += d.amount;
        curr.count += 1;
        tickerMap.set(ticker, curr);
      }

      for (const t of taxes) {
        taxSum += Math.abs(t.amount);
      }

      const grossSum = netSum + taxSum;

      const sortedMonths = Array.from(monthlyMap.keys()).sort();
      const monthPoints = sortedMonths.map((m) => {
        const [y, mm] = m.split('-');
        const dateObj = new Date(parseInt(y), parseInt(mm) - 1, 1);
        const label = dateObj.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
        return {
          month: m,
          label,
          amount: +monthlyMap.get(m)!.toFixed(2),
        };
      });

      const topTickers = Array.from(tickerMap.values()).sort((a, b) => b.net - a.net);

      return {
        dividendOps: divs,
        taxOps: taxes,
        totalGross: grossSum,
        totalNet: netSum,
        totalTax: taxSum,
        monthlyData: monthPoints,
        tickerBreakdown: topTickers,
      };
    }, [cashOperations]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-semibold text-slate-700 dark:text-slate-300">{data.label}</div>
          <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
            {formatMoney(data.amount)} netto
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
    <div className="space-y-6">
      {/* 3 Podsumowujące karty dywidendowe */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-theme p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Wypłacone Dywidendy Netto
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-medium">
              Na konto
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300">
            +{formatMoney(totalNet)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Rzeczywista kwota zaksięgowana na rachunkach.
          </p>
        </div>

        <div className="card-theme p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Podatek Potrącony u Źródła
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-medium">
              W-8BEN / Tax
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            -{formatMoney(totalTax)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Podatek pobrany przez zagraniczne urzędy skarbowe (np. IRS 15%).
          </p>
        </div>

        <div className="card-theme p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Dywidendy Brutto
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-medium">
              Przed podatkiem
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            +{formatMoney(totalGross)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Całkowita wartość przyznanych dywidend przez spółki.
          </p>
        </div>
      </div>

      {/* Wykres miesięczny i zestawienie spółek */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wykres słupkowy */}
        <div className="lg:col-span-8 card-theme p-5 sm:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Miesięczny Pasywny Dochód z Dywidend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Strumień wypłat dywidend netto w poszczególnych miesiącach
              </p>
            </div>
          </div>

          {monthlyData.length === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-slate-400 text-xs">
              <Coins className="w-8 h-8 mb-2 opacity-40" />
              Brak historii wypłat dywidend w wybranym okresie.
            </div>
          ) : (
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.6} vertical={false} />
                  <XAxis dataKey="label" stroke={axisColor} fontSize={11} tickLine={false} />
                  <YAxis
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => (privacyMode ? '•••' : `${v} zł`)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top płatnicy dywidend */}
        <div className="lg:col-span-4 card-theme p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Spółki Dywidendowe
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Które spółki wypłaciły najwięcej środków
            </p>

            <div className="space-y-3">
              {tickerBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Brak danych.</p>
              ) : (
                tickerBreakdown.slice(0, 5).map((item) => (
                  <div
                    key={item.ticker}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-200 font-mono text-sm block">
                        {item.ticker}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.count} {item.count === 1 ? 'wypłata' : 'wypłaty'}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-amber-700 dark:text-amber-400 text-right">
                      +{formatMoney(item.net)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
