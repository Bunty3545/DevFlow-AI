'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export type UserRole = 'admin' | 'officer' | 'manager' | 'agency';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  organization: string;
  phone?: string;
  assignedProjects?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchRoleForDemo: (role: UserRole) => Promise<void>;
  updateLocalUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('infrawatch_token');
    const savedUser = localStorage.getItem('infrawatch_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('infrawatch_token');
        localStorage.removeItem('infrawatch_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('infrawatch_token', res.token);
        localStorage.setItem('infrawatch_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        localStorage.setItem('infrawatch_token', res.token);
        localStorage.setItem('infrawatch_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('infrawatch_token');
    localStorage.removeItem('infrawatch_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // Demo Switcher for Evaluation Committee
  const switchRoleForDemo = async (targetRole: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      admin: { email: 'admin@infrawatch.gov.in', pass: 'Admin@123' },
      officer: { email: 'officer@infrawatch.gov.in', pass: 'Officer@123' },
      manager: { email: 'manager@infrawatch.gov.in', pass: 'Manager@123' },
      agency: { email: 'agency@infrawatch.gov.in', pass: 'Agency@123' }
    };
    const c = creds[targetRole];
    await login(c.email, c.pass);
  };

  const updateLocalUser = (partial: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...partial };
      localStorage.setItem('infrawatch_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'officer',
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        switchRoleForDemo,
        updateLocalUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

