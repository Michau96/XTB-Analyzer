import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { DateFilterRange } from '../../types/portfolio';
import {
  UploadCloud,
  Eye,
  EyeOff,
  Sun,
  Moon,
  User,
  ChevronDown,
  Layers,
  Files,
  Check,
} from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload, onOpenAuth }) => {
  const {
    accountNumbers,
    accountFilter,
    setAccountFilter,
    dateFilter,
    setDateFilter,
    privacyMode,
    togglePrivacyMode,
    theme,
    toggleTheme,
  } = usePortfolio();

  const { user } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const dateFilterOptions: { key: DateFilterRange; label: string }[] = [
    { key: 'ALL', label: 'Wszystko' },
    { key: '1Y', label: '1R' },
    { key: 'YTD', label: 'YTD' },
    { key: '6M', label: '6M' },
    { key: '3M', label: '3M' },
    { key: '1M', label: '1M' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Portfolio Header */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/20">
                <span className="tracking-tighter text-sm font-mono font-bold">XTB</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  XTB Unified Portfolio
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-mono font-semibold">
                    CAŁOŚCIOWY
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Główne konto + IKE + IKZE w jednym miejscu
                </div>
              </div>
            </div>

            {/* Account Selector */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {accountFilter === 'ALL'
                    ? `Wszystkie rachunki (${accountNumbers.length > 0 ? accountNumbers.length : '1'})`
                    : `Rachunek #${accountFilter}`}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {showAccountMenu && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
                    Widok Rachunków XTB
                  </div>

                  <div className="space-y-1 my-1">
                    <button
                      onClick={() => {
                        setAccountFilter('ALL');
                        setShowAccountMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        accountFilter === 'ALL'
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div>Połączony portfel (Wszystkie)</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          Całościowa analiza majątku
                        </div>
                      </div>
                      {accountFilter === 'ALL' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </button>

                    {accountNumbers.map((acc) => (
                      <button
                        key={acc}
                        onClick={() => {
                          setAccountFilter(acc);
                          setShowAccountMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          accountFilter === acc
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-mono font-bold">Rachunek #{acc}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Pojedyncze subkonto</div>
                        </div>
                        {accountFilter === acc && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        onOpenUpload();
                      }}
                      className="w-full px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors font-semibold"
                    >
                      <Files className="w-3.5 h-3.5" />
                      Dodaj kolejne pliki raportów
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Date Filter Pills */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {dateFilterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateFilter(opt.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  dateFilter === opt.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Przełącz na Jasny motyw' : 'Przełącz na Ciemny motyw'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:border-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Import Button */}
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Wgraj Pliki</span>
            </button>

            {/* Auth Button */}
            <button
              onClick={onOpenAuth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                {user ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Date Filter Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto gap-1">
          {dateFilterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setDateFilter(opt.key)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
                dateFilter === opt.key
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
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
