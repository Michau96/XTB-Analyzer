import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Navbar } from './components/layout/Navbar';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { AssetAllocationChart } from './components/dashboard/AssetAllocationChart';
import { PnLChart } from './components/dashboard/PnLChart';
import { BenchmarkChart } from './components/dashboard/BenchmarkChart';
import { AssetDonutChart } from './components/dashboard/AssetDonutChart';
import { TradesTable } from './components/trades/TradesTable';
import { CashFlowTable } from './components/cashflow/CashFlowTable';
import { DividendCenter } from './components/dividends/DividendCenter';
import { OpenPositionsTable } from './components/openpositions/OpenPositionsTable';
import { FileUploadModal } from './components/upload/FileUploadModal';
import { AuthModal } from './components/auth/AuthModal';
import {
  LayoutDashboard,
  Layers,
  Coins,
  TrendingUp,
  Download,
  ChevronRight,
  Files,
} from 'lucide-react';

type TabType = 'DASHBOARD' | 'TRADES' | 'CASHFLOW' | 'DIVIDENDS';

const DashboardContent: React.FC<{ onNavigateToTrades: () => void }> = ({ onNavigateToTrades }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Główne KPI / Metryki */}
      <SummaryCards />

      {/* 2 Główne Wykresy: Struktura portfela w czasie + Zyski i Straty P&L */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetAllocationChart />
        <PnLChart />
      </div>

      {/* Wykres Porównania z rynkiem (Benchmarking) + Alokacja Aktywów (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <BenchmarkChart />
        </div>
        <div className="lg:col-span-5">
          <AssetDonutChart />
        </div>
      </div>

      {/* Otwarte Pozycje */}
      <OpenPositionsTable />

      {/* Podgląd Ostatnich Transakcji */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Ostatnio Zamknięte Pozycje
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Podgląd ostatnich zrealizowanych transakcji ze wszystkich rachunków</p>
          </div>

          <button
            onClick={onNavigateToTrades}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            Zobacz wszystkie transakcje
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <TradesTable />
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { exportPortfolioToJson } = usePortfolio();

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'DASHBOARD', label: 'Przegląd Główny', icon: LayoutDashboard },
    { id: 'TRADES', label: 'Zamknięte Pozycje', icon: Layers },
    { id: 'CASHFLOW', label: 'Operacje Gotówkowe', icon: Coins },
    { id: 'DIVIDENDS', label: 'Centrum Dywidend', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Tab Navigation Strip */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'DASHBOARD' && (
          <DashboardContent onNavigateToTrades={() => setActiveTab('TRADES')} />
        )}

        {activeTab === 'TRADES' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TradesTable />
          </div>
        )}

        {activeTab === 'CASHFLOW' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CashFlowTable />
          </div>
        )}

        {activeTab === 'DIVIDENDS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <DividendCenter />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] font-mono">
              XTB
            </div>
            <span>
              XTB Unified Portfolio &bull; Scalona analityka kont (Zwykłe, IKE, IKZE)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={exportPortfolioToJson}
              className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Kopia Zapasowa (JSON)
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold"
            >
              <Files className="w-3.5 h-3.5" />
              Wgraj kolejne pliki XLSX
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <MainApp />
      </PortfolioProvider>
    </AuthProvider>
  );
}
