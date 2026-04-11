import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface AuthSession {
  name: string;
  email: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => { success: boolean; message?: string };
  logout: () => void;
}

const STORAGE_KEY = 'tmkp_auth_session';

const demoAccount: AuthSession & { password: string } = {
  name: 'Admin TMKP',
  email: 'admin',
  password: 'Z#nn5~8f!d1a',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed?.name && parsed?.email) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(getInitialSession);

  const login: AuthContextType['login'] = ({ email, password }) => {
    if (
      demoAccount.email.toLowerCase() === email.trim().toLowerCase() &&
      demoAccount.password === password
    ) {
      const nextSession: AuthSession = {
        name: demoAccount.name,
        email: demoAccount.email,
      };

      setSession(nextSession);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      }

      return { success: true };
    }

    return {
      success: false,
      message: 'Kredensial tidak valid. Periksa email dan password.',
    };
  };

  const logout = () => {
    setSession(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
