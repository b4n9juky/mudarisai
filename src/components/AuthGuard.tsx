import { useAuth } from '../stores/authStore';
import LoginPage from '../pages/LoginPage';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!state.user || !state.token) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
