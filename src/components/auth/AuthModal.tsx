import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { X, User as UserIcon, LogIn, UserPlus, LogOut, ShieldCheck, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, login, signup, logout, loginAsGuest } = useAuth();
  const { clearPortfolioData } = usePortfolio();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setError('Wystąpił błąd logowania. Sprawdź poprawność danych.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isAuthenticated ? 'Konto Inwestora' : mode === 'LOGIN' ? 'Zaloguj się' : 'Utwórz konto'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAuthenticated ? 'Zarządzaj swoim profilem i portfelami' : 'Synchronizuj dane XTB między urządzeniami'}
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

        {/* Body */}
        <div className="p-6">
          {isAuthenticated && user ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg border border-emerald-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{user.name}</h4>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1 inline-block">
                    {user.isGuest ? 'Tryb Gościa' : 'Konto Aktywne'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Wyloguj się
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                  {error}
                </div>
              )}

              {mode === 'SIGNUP' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Imię i nazwisko</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. Jan Kowalski"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">Adres e-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj.email@inwestor.pl"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Hasło</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {mode === 'LOGIN' ? 'Zaloguj się' : 'Utwórz konto'}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {mode === 'LOGIN' ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    loginAsGuest();
                    onClose();
                  }}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Tryb Demo
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
