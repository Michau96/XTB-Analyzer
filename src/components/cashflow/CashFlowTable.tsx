import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { CashOperationType, XtbCashOperation } from '../../types/portfolio';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Receipt,
  PiggyBank,
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const CashFlowTable: React.FC = () => {
  const { filteredCashOperations, formatMoney, deleteCashOp } = usePortfolio();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CashOperationType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const processedOps = useMemo(() => {
    return filteredCashOperations.filter((op) => {
      const matchesSearch =
        (op.comment || '').toLowerCase().includes(search.toLowerCase()) ||
        op.typeRaw.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === 'ALL' || op.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [filteredCashOperations, search, typeFilter]);

  const totalPages = Math.ceil(processedOps.length / pageSize) || 1;
  const paginatedOps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedOps.slice(start, start + pageSize);
  }, [processedOps, currentPage, pageSize]);

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

  const getTypeBadge = (type: CashOperationType, typeRaw: string) => {
    switch (type) {
      case 'DEPOSIT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="w-3 h-3" />
            Wpłata
          </span>
        );
      case 'WITHDRAWAL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ArrowUpRight className="w-3 h-3" />
            Wypłata
          </span>
        );
      case 'DIVIDEND':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="w-3 h-3" />
            Dywidenda
          </span>
        );
      case 'TAX':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <Receipt className="w-3 h-3" />
            Podatek
          </span>
        );
      case 'INTEREST':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <PiggyBank className="w-3 h-3" />
            Odsetki
          </span>
        );
      default:
        return (
          <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-slate-800 text-slate-300">
            {typeRaw || 'Inne'}
          </span>
        );
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            Operacje Gotówkowe i Przepływy (Cash Flow)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historia wpłat, wypłat, otrzymanych dywidend, podatków u źródła oraz odsetek z XTB.
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
          Łącznie operacji: {filteredCashOperations.length}
        </span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtruj opis lub komentarz operacji..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 appearance-none"
          >
            <option value="ALL">Wszystkie typy operacji</option>
            <option value="DEPOSIT">Wpłaty (Deposits)</option>
            <option value="WITHDRAWAL">Wypłaty (Withdrawals)</option>
            <option value="DIVIDEND">Dywidendy (Dividends)</option>
            <option value="TAX">Podatki u źródła (Withholding tax)</option>
            <option value="INTEREST">Odsetki od wolnych środków (Interest)</option>
            <option value="FEE">Opłaty i prowizje (Fees)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Data i Czas</th>
              <th className="py-3 px-3">Typ Operacji</th>
              <th className="py-3 px-4">Opis / Komentarz</th>
              <th className="py-3 px-4 text-right">Kwota</th>
              <th className="py-3 px-3 text-center">Akcja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 bg-slate-950/40">
            {paginatedOps.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Brak operacji gotówkowych spełniających kryteria.
                </td>
              </tr>
            ) : (
              paginatedOps.map((op) => {
                const isPositive = op.amount >= 0;
                return (
                  <tr key={op.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {formatDate(op.time)}
                    </td>

                    <td className="py-3 px-3">
                      {getTypeBadge(op.type, op.typeRaw)}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-medium text-slate-200">{op.typeRaw}</div>
                      {op.comment && <div className="text-[11px] text-slate-400">{op.comment}</div>}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                        {isPositive ? '+' : ''}
                        {formatMoney(op.amount, op.currency || 'PLN')}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm('Czy na pewno usunąć tę operację gotówkową?')) {
                            deleteCashOp(op.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Usuń wpis"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
          Pokazano <span className="font-semibold text-slate-200">{paginatedOps.length}</span> z{' '}
          <span className="font-semibold text-slate-200">{processedOps.length}</span> wpisów
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
    </div>
  );
};
