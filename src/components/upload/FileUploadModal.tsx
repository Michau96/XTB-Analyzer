import React, { useState, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { parseMultipleXtbFiles } from '../../lib/parser/xtbParser';
import { ParseResult } from '../../types/portfolio';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Files,
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
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [replaceMode, setReplaceMode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleMultipleFilesProcess = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const fileArray = Array.from(files);
    setSelectedFileNames(fileArray.map((f) => f.name));

    try {
      const buffers = await Promise.all(fileArray.map((f) => f.arrayBuffer()));
      const result = parseMultipleXtbFiles(
        buffers,
        replaceMode ? [] : trades,
        replaceMode ? [] : cashOperations
      );
      setParseResult(result);

      if (result.success) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setParseResult({
        success: false,
        accountNumbers: [],
        trades: [],
        cashOperations: [],
        openPositions: [],
        warnings: [`Wystąpił błąd podczas przetwarzania plików: ${err.message || 'Nieznany błąd'}`],
        filesProcessedCount: fileArray.length,
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
      handleMultipleFilesProcess(e.dataTransfer.files);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFilesProcess(e.target.files);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult && parseResult.success) {
      addParsedData(parseResult, replaceMode);
      onClose();
      setParseResult(null);
      setSelectedFileNames([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
              <Files className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Importuj Raporty XTB (Wiele plików)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wgraj jednocześnie raporty z konta głównego, IKE, IKZE i innych – połączymy je w <strong>jeden spójny portfel</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                  : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-950/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                multiple
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center mb-4">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">
                Przeciągnij i upuść jeden lub wiele plików XLSX/CSV
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Możesz zaznaczyć i wgrać kilka plików naraz (np. <em>Konto Główne.xlsx</em> + <em>Konto IKE.xlsx</em> + <em>Raport_2025.csv</em>). Wszystkie dane zostaną automatycznie scalone.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Wieloplikowy import
                </span>
                <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Deduplikacja duplikatów
                </span>
                <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Jeden wspólny portfel
                </span>
              </div>
            </div>
          ) : (
            /* Results preview */
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  parseResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                    : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  {parseResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  )}
                  {parseResult.success
                    ? `Pomyślnie przetworzono ${selectedFileNames.length} ${
                        selectedFileNames.length === 1 ? 'plik' : 'pliki/plików'
                      }!`
                    : 'Błąd podczas przetwarzania raportów'}
                </div>
                
                <div className="text-xs opacity-90 mt-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-300">Wczytane pliki: </span>
                  {selectedFileNames.join(', ')}
                </div>

                {parseResult.accountNumbers.length > 0 && (
                  <div className="text-xs font-mono mt-1 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 flex-wrap">
                    <span>Wykryte rachunki:</span>
                    {parseResult.accountNumbers.map((acc) => (
                      <span key={acc} className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 font-bold">
                        #{acc}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {parseResult.warnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
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
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">Nowe pozycje zamknięte:</span>
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400 font-mono">
                    +{parseResult.newTradesCount}
                  </span>
                  {parseResult.duplicateTradesCount > 0 && (
                    <span className="text-[10px] text-slate-500 block">
                      ({parseResult.duplicateTradesCount} zignorowanych duplikatów)
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">Operacje gotówkowe:</span>
                  <span className="font-bold text-lg text-amber-600 dark:text-amber-400 font-mono">
                    +{parseResult.newOperationsCount}
                  </span>
                  {parseResult.duplicateOperationsCount > 0 && (
                    <span className="text-[10px] text-slate-500 block">
                      ({parseResult.duplicateOperationsCount} zignorowanych duplikatów)
                    </span>
                  )}
                </div>
              </div>

              {/* Replace toggle */}
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceMode}
                  onChange={(e) => setReplaceMode(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span>Zastąp istniejący portfel (wyczyść obecną bazę przed importem tych plików)</span>
              </label>
            </div>
          )}

          {/* Quick Demo Loader */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 block">Nie masz plików pod ręką?</span>
              <span className="text-[11px] text-slate-500">
                Załaduj połączony portfel demo (Konto Główne PLN + Rachunek IKE).
              </span>
            </div>

            <button
              onClick={handleLoadSample}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Wgraj Demo XTB
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {parseResult ? (
            <button
              onClick={() => {
                setParseResult(null);
                setSelectedFileNames([]);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Wybierz inne pliki
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Anuluj
            </button>
            {parseResult && parseResult.success && (
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Połącz i Zapisz w Portfelu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
