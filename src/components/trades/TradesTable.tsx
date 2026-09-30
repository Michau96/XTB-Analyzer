import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { XtbTrade, AssetCategory } from '../../types/portfolio';
import { TradeDetailModal } from './TradeDetailModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const TradesTable: React.FC = () => {
  const { filteredTrades, formatMoney, deleteTrade, exportTradesToCsv } = usePortfolio();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [profitFilter, setProfitFilter] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');
  const [sortField, setSortField] = useState<'closeTime' | 'profitNet' | 'returnPercent' | 'saleValue'>('closeTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTrade, setSelectedTrade] = useState<XtbTrade | null>(null);

  // Filter & sort
  const processedTrades = useMemo(() => {
    return filteredTrades
      .filter((trade) => {
        const matchesSearch =
          trade.ticker.toLowerCase().includes(search.toLowerCase()) ||
          trade.instrument.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
          categoryFilter === 'ALL' || trade.category === categoryFilter;

        const matchesProfit =
          profitFilter === 'ALL' ||
          (profitFilter === 'PROFIT' && trade.profitNet >= 0) ||
          (profitFilter === 'LOSS' && trade.profitNet < 0);

        return matchesSearch && matchesCategory && matchesProfit;
      })
      .sort((a, b) => {
        let valA = a[sortField] ?? 0;
        let valB = b[sortField] ?? 0;

        if (sortField === 'closeTime') {
          valA = new Date(a.closeTime).getTime();
          valB = new Date(b.closeTime).getTime();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [filteredTrades, search, categoryFilter, profitFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedTrades.length / pageSize) || 1;
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTrades.slice(start, start + pageSize);
  }, [processedTrades, currentPage, pageSize]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Historia Zamkniętych Pozycji
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Zestawienie transakcji z XTB z kalkulacją zysków, stóp zwrotu i czasu trzymania.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportTradesToCsv}
            disabled={filteredTrades.length === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Eksportuj CSV
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Szukaj po tickerze lub nazwie..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="ALL">Wszystkie aktywa</option>
            <option value="STOCK">Akcje (Stocks)</option>
            <option value="ETF">Fundusze ETF</option>
            <option value="CFD">Kontrakty CFD</option>
            <option value="CRYPTO">Kryptowaluty</option>
          </select>
        </div>

        {/* Profit/Loss filter */}
        <div className="relative">
          <select
            value={profitFilter}
            onChange={(e) => {
              setProfitFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="ALL">Wszystkie wyniki</option>
            <option value="PROFIT">Tylko zyskowne (+)</option>
            <option value="LOSS">Tylko stratne (-)</option>
          </select>
        </div>

        {/* Page size */}
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400">
          <span>Na stronie:</span>
          <div className="flex gap-1.5">
            {[10, 25, 50].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded font-mono font-medium ${
                  pageSize === size
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Instrument / Ticker</th>
              <th className="py-3 px-3">Typ</th>
              <th className="py-3 px-3">Ilość</th>
              <th className="py-3 px-3">Cena Zak. / Sprz.</th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('closeTime')}
              >
                <div className="flex items-center gap-1">
                  Data zamknięcia
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('returnPercent')}
              >
                <div className="flex items-center gap-1">
                  Zwrot %
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('profitNet')}
              >
                <div className="flex items-center justify-end gap-1">
                  Zysk Netto (PLN)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 bg-slate-950/40">
            {paginatedTrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Nie znaleziono transakcji odpowiadających wybranym filtrom.
                </td>
              </tr>
            ) : (
              paginatedTrades.map((trade) => {
                const isProfit = trade.profitNet >= 0;
                const retPct = trade.returnPercent || 0;

                return (
                  <tr
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200 font-mono flex items-center gap-2">
                        {trade.ticker}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                          {trade.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {trade.instrument}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          trade.type === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {trade.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-300">
                      {trade.volume}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">
                      <div>{trade.openPrice.toFixed(2)}</div>
                      <div className="text-slate-300 font-medium">{trade.closePrice.toFixed(2)}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-400 font-mono">
                      <div>{formatDate(trade.closeTime)}</div>
                      <div className="text-[10px] text-slate-500">
                        {trade.durationDays ?? 0} dni w portfelu
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span
                        className={`font-bold flex items-center gap-0.5 ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {retPct >= 0 ? '+' : ''}
                        {retPct.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                        {isProfit ? '+' : ''}
                        {formatMoney(trade.profitNet)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedTrade(trade)}
                          title="Pokaż szczegóły"
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Czy na pewno usunąć transakcję ${trade.ticker}?`)) {
                              deleteTrade(trade.id);
                            }
                          }}
                          title="Usuń transakcję"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <div>
          Pokazano <span className="font-semibold text-slate-200">{paginatedTrades.length}</span> z{' '}
          <span className="font-semibold text-slate-200">{processedTrades.length}</span> transakcji
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono">
            Strona <strong className="text-white">{currentPage}</strong> z <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <TradeDetailModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
    </div>
  );
};
