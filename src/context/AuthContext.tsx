import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'xtb_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Default to logged-in demo user for immediate great experience
        const defaultUser: User = {
          id: 'usr_default_01',
          email: 'inwestor@xtb.pl',
          name: 'Michał Bogacz',
          isGuest: false,
        };
        setUser(defaultUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate auth
    await new Promise((r) => setTimeout(r, 400));
    const name = email.split('@')[0];
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      isGuest: false,
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const signup = async (email: string, _pass: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      isGuest: false,
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      email: 'gosc@demo.pl',
      name: 'Gość Demo',
      isGuest: true,
    };
    setUser(guestUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
