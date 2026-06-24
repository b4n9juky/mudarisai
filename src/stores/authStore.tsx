import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { User, AuthState } from '../types/auth';
import { authApi } from '../lib/api';

const AUTH_KEY = 'mudaris_auth';

function persistAuth(data: { user: User; token: string }) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

function loadAuth(): { user: User; token: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESTORE'; payload: { user: User; token: string } };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: '' };
    case 'LOGIN_SUCCESS':
      return { user: action.payload.user, token: action.payload.token, loading: false, error: '' };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { user: null, token: null, loading: false, error: '' };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'RESTORE':
      return { user: action.payload.user, token: action.payload.token, loading: false, error: '' };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const saved = loadAuth();
  const [state, dispatch] = useReducer(authReducer, {
    user: saved?.user || null,
    token: saved?.token || null,
    loading: !!saved,
    error: '',
  });

  useEffect(() => {
    if (state.token) {
      authApi.me()
        .then((res) => {
          const u = res.user;
          const user: User = {
            id: u.id,
            username: u.username,
            role: u.role,
            guruId: u.guru_id || null,
            namaGuru: u.nama_guru || null,
            namaMadrasah: u.nama_madrasah || null,
          };
          persistAuth({ user, token: state.token! });
          dispatch({ type: 'RESTORE', payload: { user, token: state.token! } });
        })
        .catch(() => {
          clearAuth();
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await authApi.login(username, password);
      const user: User = {
        id: res.user.id,
        username: res.user.username,
        role: res.user.role,
        guruId: res.user.guru_id || null,
        namaGuru: res.user.nama_guru || null,
        namaMadrasah: res.user.nama_madrasah || null,
      };
      persistAuth({ user, token: res.token });
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: res.token } });
    } catch (err: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: err.message || 'Login gagal' });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout, isAdmin: state.user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
