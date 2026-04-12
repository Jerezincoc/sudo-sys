// packages/ui/src/shared/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ipcClient } from './ipcClient';

interface User {
  id: string;
  nome: string;
  email: string;
  roles: string[];
}

interface AuthContextData {
  user: User | null;
  login: (email: string, passwordRaw: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('@SudoSys:user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, passwordRaw: string) {
    // ipcClient.auth precisa ser implementado, usamos usersHandlers pra 'auth:login'
    // Mas o client ipcClient.ts não tem auth.login mapeado ainda, faremos na mao via helper ou extendemos
    const response = await (window as any).sudoSysIpc.invoke('auth:login', { email, passwordRaw });
    if (!response.ok) {
      throw new Error(response.error?.message || 'Falha no login');
    }
    setUser(response.data);
    localStorage.setItem('@SudoSys:user', JSON.stringify(response.data));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('@SudoSys:user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
