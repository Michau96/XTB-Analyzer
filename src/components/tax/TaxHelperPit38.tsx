import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { calculateTaxSummaryPIT38 } from '../../lib/analytics/metrics';
import {
  FileText,
  Calculator,
  AlertCircle,
  HelpCircle,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

export const TaxHelperPit38: React.FC = () => {
  const { trades, cashOperations, formatMoney } = usePortfolio();

  // Extract available years from data
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>();
    for (const t of trades) {
      yearSet.add(new Date(t.closeTime).getFullYear());
    }
    for (const op of cashOperations) {
      yearSet.add(new Date(op.time).getFullYear());
    }
    if (yearSet.size === 0) {
      yearSet.add(new Date().getFullYear());
    }
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [trades, cashOperations]);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return availableYears[0] || new Date().getFullYear();
  });

  const taxSummary = useMemo(() => {
    return calculateTaxSummaryPIT38(trades, cashOperations, selectedYear);
  }, [trades, cashOperations, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header & Year selector */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Asystent Podatkowy PIT-38 (Kalkulator Belki)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Zestawienie przychodów, kosztów i dywidend do deklaracji podatkowej PIT-38 oraz załącznika PIT/ZG.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Rok podatkowy:</span>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all font-mono ${
                  selectedYear === yr
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2 Main Columns: Sekcja C & Sekcja G */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sekcja C: Akcje, ETF i instrumenty finansowe */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Sekcja C (art. 30b ust. 2)
              </h4>
              <p className="text-[11px] text-slate-400">
                Odpłatne zbycie papierów wartościowych, ETF i CFD
              </p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {taxSummary.tradesCount} transakcji w {selectedYear}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400">Przychód (Wartość sprzedaży):</span>
              <span className="font-bold text-slate-200">
                {formatMoney(taxSummary.revenueSectionC)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400">Koszty uzyskania przychodów (KUP):</span>
              <span className="font-bold text-slate-200">
                {formatMoney(taxSummary.costsSectionC)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400">
                {taxSummary.incomeSectionC > 0 ? 'Dochód do opodatkowania:' : 'Strata podatkowa:'}
              </span>
              <span
                className={`font-bold ${
                  taxSummary.incomeSectionC > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {taxSummary.incomeSectionC > 0
                  ? formatMoney(taxSummary.incomeSectionC)
                  : `-${formatMoney(taxSummary.lossSectionC)}`}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <span className="font-semibold text-emerald-300">Należny podatek 19% (art. 30b):</span>
              <span className="text-lg font-bold text-emerald-400">
                {formatMoney(taxSummary.taxDueSectionC)}
              </span>
            </div>
          </div>
        </div>

        {/* Sekcja G / Dywidendy zagraniczne */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Dywidendy Zagraniczne & PIT/ZG (art. 30b ust. 5a)
              </h4>
              <p className="text-[11px] text-slate-400">
                Rozliczenie podatku od dywidend z zagranicy (np. USA, Holandia)
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400">Przychód z dywidend brutto:</span>
              <span className="font-bold text-slate-200">
                {formatMoney(taxSummary.foreignDividendsGross)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400">Podatek potrącony za granicą (np. 15%):</span>
              <span className="font-bold text-rose-400">
                -{formatMoney(taxSummary.taxPaidAbroad)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-400">Stawka podatku w Polsce (19%):</span>
              <span className="font-bold text-slate-300">
                {formatMoney(taxSummary.taxDue19PctPoland)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div>
                <span className="font-semibold text-amber-300 block">Dopłata podatku w Polsce:</span>
                <span className="text-[10px] text-slate-400 font-sans">
                  Różnica między 19% a podatkiem u źródła
                </span>
              </div>
              <span className="text-lg font-bold text-amber-400">
                {formatMoney(taxSummary.additionalTaxToPayPL)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Disclaimer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">Informacja o rozliczeniu podatkowym</span>
          <p>
            Wyliczenia mają charakter pomocniczy na podstawie danych z raportu XTB. XTB dla polskich rezydentów podatkowych wystawia również oficjalny formularz <strong>PIT-8C</strong>. W przypadku dywidend zagranicznych (np. akcje USA z formularzem W-8BEN, gdzie potrącono 15%), w polskim PIT-38 (sekcja G lub załącznik PIT/ZG) wykazuje się 19% podatku z prawem do odliczenia 15% zapłaconych w USA, dopłacając pozostałe 4% w Polsce.
          </p>
        </div>
      </div>
    </div>
  );
};
