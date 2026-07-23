// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../api';
import { apiCall, saveToken, getToken, removeToken } from './useApiClient';
import { ROLE_PERMISSIONS } from '../rbac/permissions';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (module: string, action: string) => boolean;
  canAccess: (module: string) => boolean;
  isRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapRole(backendRole: string): string {
  const MAP: Record<string, string> = {
    'superadmin': 'superadmin',
    'admin_ops': 'admin_operations',
    'admin_operations': 'admin_operations',
    'admin_finance': 'admin_finance',
    'admin_fraude': 'admin_fraude',
    'admin_chauffeurs': 'admin_chauffeurs',
    'support': 'support_client',
    'support_client': 'support_client',
    'analyste_ia': 'analyste_ia',
    'responsable_agence': 'admin_operations',
  };
  return MAP[backendRole] || 'support_client';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const savedUser = localStorage.getItem('coligo_user');
    if (!token) { setLoading(false); return; }
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); setLoading(false); return; } catch {}
    }
    apiCall<any>(API.ME)
      .then(data => {
        const userData = data.user || data.admin || data;
        setUser(userData);
        localStorage.setItem('coligo_user', JSON.stringify(userData));
      })
      .catch(() => console.warn('ME endpoint failed'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await apiCall<any>(API.LOGIN, 'POST', { email, password });
    const token = data.tokens?.access || data.access || data.token;
    if (!token) throw new Error('Token manquant dans la réponse');
    saveToken(token);
    const userData: User = {
      id: data.user?.id || data.id || 1,
      email: data.user?.email || data.email || email,
      role: data.user?.role || data.role || 'support_client',
      first_name: data.user?.first_name || data.first_name || email.split('@')[0],
      last_name: data.user?.last_name || data.last_name || '',
    };
    setUser(userData);
    return data;
    localStorage.setItem('coligo_user', JSON.stringify(userData));
  }

  function logout() {
    removeToken();
    localStorage.removeItem('coligo_user');
    setUser(null);
  }

  function can(module: string, action: string): boolean {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    const mapped = mapRole(user.role);
    const perms = ROLE_PERMISSIONS[mapped];
    if (!perms) return false;
    return perms[module]?.includes(action) ?? false;
  }

  function canAccess(module: string): boolean {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    const mapped = mapRole(user.role);
    const perms = ROLE_PERMISSIONS[mapped];
    if (!perms) return false;
    return (perms[module]?.length ?? 0) > 0;
  }

  function isRole(...roles: string[]): boolean {
    if (!user) return false;
    const mapped = mapRole(user.role);
    return roles.includes(user.role) || roles.includes(mapped);
  }

  const mappedRole = user ? mapRole(user.role) : null;

  return (
    <AuthContext.Provider value={{ user, role: mappedRole, loading, login, logout, can, canAccess, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}