import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { TrendingUp, TrendingDown, Clock, Layers, Sparkles } from 'lucide-react';

export const OpenPositionsTable: React.FC = () => {
  const { openPositions, formatMoney } = usePortfolio();

  if (!openPositions || openPositions.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center text-slate-400">
        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-sm font-semibold text-slate-300">Brak aktualnie otwartych pozycji</p>
        <p className="text-xs text-slate-500 mt-1">
          Wszystkie pozycje w tym portfelu zostały zamknięte lub nie zostały wgrane w pliku XLSX.
        </p>
      </div>
    );
  }

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Otwarte Pozycje (Wycena Bieżąca)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Aktywne walory w portfelu z aktualną wyceną rynkową i niezrealizowanym zyskiem.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/20">
          {openPositions.length} pozycji
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Instrument</th>
              <th className="py-3 px-3">Ilość</th>
              <th className="py-3 px-3">Cena zakupu</th>
              <th className="py-3 px-3">Kurs bieżący</th>
              <th className="py-3 px-4">Wartość rynkowa</th>
              <th className="py-3 px-4 text-right">Niezrealizowany Zysk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 bg-slate-950/40 font-mono">
            {openPositions.map((pos) => {
              const isProfit = pos.unrealizedProfit >= 0;
              return (
                <tr key={pos.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-slate-200 font-mono flex items-center gap-2">
                      {pos.ticker}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                        {pos.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{pos.instrument}</div>
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    {pos.volume} szt.
                  </td>

                  <td className="py-3 px-3 text-slate-400">
                    {pos.openPrice.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 text-emerald-300 font-semibold">
                    {pos.currentPrice.toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-slate-200 font-bold">
                    {formatMoney(pos.currentValue)}
                  </td>

                  <td className="py-3 px-4 text-right font-bold">
                    <div className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                      {isProfit ? '+' : ''}
                      {formatMoney(pos.unrealizedProfit)}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {isProfit ? '+' : ''}
                      {pos.returnPercent.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
