import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAccounts } from '@/data/initialData';

interface User {
  username: string;
  role: 'admin' | 'teacher';
  teacherId: string | null;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edu_crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('edu_crm_user', JSON.stringify(user));
    else localStorage.removeItem('edu_crm_user');
  }, [user]);

  const login = (username: string, password: string) => {
    const account = userAccounts.find(a => a.username === username && a.password === password);
    if (account) {
      setUser({ username: account.username, role: account.role, teacherId: account.teacherId, name: account.name });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
