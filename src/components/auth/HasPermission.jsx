'use client';

import usePermissionsStore from '@/store/permissionsStore';
import useAuthStore from '@/store/authStore';

export default function HasPermission({ required, children, fallback = null }) {
  const { isSuperAdmin } = useAuthStore();
  const hasPerm = usePermissionsStore((state) => state.hasPermission(required));
  const isFetched = usePermissionsStore((state) => state.isFetched);

  // Le super_admin global a toujours accès
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Si les permissions ne sont pas encore chargées, on affiche rien ou un fallback
  if (!isFetched) {
    return null;
  }

  return hasPerm ? <>{children}</> : fallback;
}
