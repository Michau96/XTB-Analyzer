import React, { useState, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { parseXtbFile } from '../../lib/parser/xtbParser';
import { ParseResult } from '../../types/portfolio';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCode,
  Sparkles,
  RefreshCw,
  Plus,
  Layers,
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose }) => {
  const { trades, cashOperations, addParsedData, loadDemoData } = usePortfolio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [replaceMode, setReplaceMode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseXtbFile(buffer, replaceMode ? [] : trades, replaceMode ? [] : cashOperations);
      setParseResult(result);

      if (result.success) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setParseResult({
        success: false,
        trades: [],
        cashOperations: [],
        openPositions: [],
        warnings: [`Wystąpił błąd podczas przetwarzania pliku: ${err.message || 'Nieznany błąd'}`],
        newTradesCount: 0,
        duplicateTradesCount: 0,
        newOperationsCount: 0,
        duplicateOperationsCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult && parseResult.success) {
      addParsedData(parseResult, replaceMode);
      onClose();
      setParseResult(null);
    }
  };

  const handleLoadSample = () => {
    loadDemoData();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Importuj Raport XTB (XLSX / CSV)</h3>
              <p className="text-xs text-slate-400">
                Wgraj plik wyeksportowany z platformy XTB (xStation 5 / aplikacja mobilna).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Dropzone */}
          {!parseResult ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h4 className="font-bold text-slate-200 text-sm mb-1">
                Przeciągnij i upuść raport XLSX lub kliknij, aby wybrać
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Obsługiwane formaty: <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong> zawierające zakładki "Pozycje zamknięte" oraz "Operacje gotówkowe".
              </p>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Deduplikacja automatycznie pomija już wcześniej dodane wpisy
              </div>
            </div>
          ) : (
            /* Results preview */
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  parseResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  {parseResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  {parseResult.success
                    ? 'Raport XTB został pomyślnie przetworzony!'
                    : 'Błąd podczas przetwarzania raportu'}
                </div>
                <p className="text-xs opacity-90">Plik: {fileName}</p>
                {parseResult.accountNumber && (
                  <p className="text-xs font-mono mt-0.5">
                    Numer konta XTB: <strong>{parseResult.accountNumber}</strong>
                  </p>
                )}
              </div>

              {parseResult.warnings.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300 space-y-1">
                  {parseResult.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Nowe pozycje zamknięte:</span>
                  <span className="font-bold text-lg text-emerald-400 font-mono">
                    +{parseResult.newTradesCount}
                  </span>
                  {parseResult.duplicateTradesCount > 0 && (
                    <span className="text-[10px] text-slate-500 block">
                      ({parseResult.duplicateTradesCount} pominiętych duplikatów)
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Operacje gotówkowe:</span>
                  <span className="font-bold text-lg text-amber-400 font-mono">
                    +{parseResult.newOperationsCount}
                  </span>
                  {parseResult.duplicateOperationsCount > 0 && (
                    <span className="text-[10px] text-slate-500 block">
                      ({parseResult.duplicateOperationsCount} pominiętych duplikatów)
                    </span>
                  )}
                </div>
              </div>

              {/* Replace toggle */}
              <label className="flex items-center gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceMode}
                  onChange={(e) => setReplaceMode(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span>Zastąp istniejący portfel (wyczyść obecne dane przed importem)</span>
              </label>
            </div>
          )}

          {/* Quick Demo Loader */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300 block">Nie masz pliku XLSX pod ręką?</span>
              <span className="text-[11px] text-slate-500">
                Załaduj pełny przykładowy portfel XTB z danymi (Allegro, Besi, ETF-y, dywidendy, wpłaty).
              </span>
            </div>

            <button
              onClick={handleLoadSample}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Wgraj Demo XTB
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          {parseResult ? (
            <button
              onClick={() => setParseResult(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Wybierz inny plik
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Anuluj
            </button>
            {parseResult && parseResult.success && (
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Zatwierdź Import
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
