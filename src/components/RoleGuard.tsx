import { useAuth } from '../stores/authStore';
import type { UserRole } from '../types/auth';

interface Props {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ roles, children, fallback }: Props) {
  const { state } = useAuth();

  if (!state.user || !roles.includes(state.user.role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
