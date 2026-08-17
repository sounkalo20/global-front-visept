import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import usePermissionsStore from '@/store/permissionsStore';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PermissionGuard({ requiredPermission, children }) {
  const router = useRouter();
  const { hasPermission, isLoading, isFetched, permissions, isSystemRole, roleName } = usePermissionsStore();

  if (isLoading || !isFetched) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAllowed = hasPermission(requiredPermission);

  if (!isAllowed) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Accès Refusé</h2>
        <p className="text-gray-500">Vous n'avez pas la permission d'accéder à cette page.</p>
        <Button onClick={() => router.push('/shop')} variant="outline">
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  return children;
}
