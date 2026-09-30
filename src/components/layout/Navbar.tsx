import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { DateFilterRange } from '../../types/portfolio';
import {
  TrendingUp,
  UploadCloud,
  Eye,
  EyeOff,
  Sun,
  Moon,
  User,
  Plus,
  ChevronDown,
  Layers,
  Sparkles,
  Shield,
} from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload, onOpenAuth }) => {
  const {
    portfolios,
    activePortfolioId,
    setActivePortfolioId,
    createPortfolio,
    accountNumber,
    dateFilter,
    setDateFilter,
    privacyMode,
    togglePrivacyMode,
    theme,
    toggleTheme,
  } = usePortfolio();

  const { user, isAuthenticated } = useAuth();
  const [showPortfolioMenu, setShowPortfolioMenu] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);

  const activePort = portfolios.find((p) => p.id === activePortfolioId) || portfolios[0];

  const dateFilterOptions: { key: DateFilterRange; label: string }[] = [
    { key: 'ALL', label: 'Wszystko' },
    { key: '1Y', label: '1R' },
    { key: 'YTD', label: 'YTD' },
    { key: '6M', label: '6M' },
    { key: '3M', label: '3M' },
    { key: '1M', label: '1M' },
  ];

  const handleCreateNewPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPortfolioName.trim()) {
      createPortfolio(newPortfolioName.trim());
      setNewPortfolioName('');
      setIsCreatingPortfolio(false);
      setShowPortfolioMenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Portfolio Selector */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
                <span className="tracking-tighter text-sm font-mono">XTB</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                  Portfolio Analyzer
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium border border-emerald-500/30">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Analityka portfela XTB</div>
              </div>
            </div>

            {/* Portfolio Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPortfolioMenu(!showPortfolioMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[120px] sm:max-w-[180px]">
                  {activePort?.name || 'Główny Portfel'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showPortfolioMenu && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
                    Twoje Portfele XTB
                  </div>

                  <div className="space-y-1 my-1">
                    {portfolios.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActivePortfolioId(p.id);
                          setShowPortfolioMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          p.id === activePortfolioId
                            ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {p.accountNumber && (
                          <span className="text-[10px] font-mono text-slate-400">
                            #{p.accountNumber}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Create new portfolio */}
                  <div className="border-t border-slate-800 pt-2 mt-1">
                    {isCreatingPortfolio ? (
                      <form onSubmit={handleCreateNewPortfolio} className="p-2 space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="Nazwa portfela..."
                          value={newPortfolioName}
                          onChange={(e) => setNewPortfolioName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                          autoFocus
                        />
                        <div className="flex gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsCreatingPortfolio(false)}
                            className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
                          >
                            Anuluj
                          </button>
                          <button
                            type="submit"
                            className="px-2.5 py-1 text-[11px] bg-emerald-500 text-white rounded-lg font-bold"
                          >
                            Dodaj
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsCreatingPortfolio(true)}
                        className="w-full px-3 py-1.5 text-xs text-emerald-400 hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Nowy Portfel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Date Filter Pills (Hidden on small mobile) */}
          <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
            {dateFilterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateFilter(opt.key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  dateFilter === opt.key
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Privacy Mode Toggle */}
            <button
              onClick={togglePrivacyMode}
              title={privacyMode ? 'Pokaż kwoty' : 'Ukryj kwoty (Tryb prywatny)'}
              className={`p-2 rounded-xl border transition-colors ${
                privacyMode
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Przełącz na Jasny motyw' : 'Przełącz na Ciemny motyw'}
              className="p-2 rounded-xl bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Import XLSX Button */}
            <button
              onClick={onOpenUpload}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Wgraj XLSX</span>
            </button>

            {/* Auth Profile Button */}
            <button
              onClick={onOpenAuth}
              className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                {user ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Date Filter Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/60 overflow-x-auto gap-1">
          {dateFilterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setDateFilter(opt.key)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
                dateFilter === opt.key
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
