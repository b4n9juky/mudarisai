// ============================================================
// AUTH TYPES
// ============================================================

export type UserRole = 'admin' | 'guru';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  guruId: number | null;
  namaGuru: string | null;
  namaMadrasah: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
