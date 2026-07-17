import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type User } from './api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => undefined,
  logout: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ user: User }>('/api/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const r = await api.post<{ user: User }>('/api/auth/login', { username, password });
    setUser(r.user);
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function useIsEngineer(): boolean {
  return useAuth().user?.role === 'engineer';
}

/**
 * Role-gated UI: engineer-only actions render for engineers and are hidden (or
 * shown disabled with a reason) for operators. The server enforces the rule
 * regardless — this is a courtesy, not the control.
 */
export function EngineerOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const isEngineer = useIsEngineer();
  return <>{isEngineer ? children : fallback}</>;
}
