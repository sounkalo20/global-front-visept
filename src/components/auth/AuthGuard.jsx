// components/auth/AuthGuard.jsx
'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import usePermissionsStore from '@/store/permissionsStore';
import { getBasePath } from '@/lib/config/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

const publicRoutes = ['/login', '/register', '/session-expired'];
const noCompanyRoutes = ['/companies', '/companies/new'];

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, isSuperAdmin, isSessionExpired } = useAuthStore();
  const { activeCompany, companies, isLoading: companiesLoading } = useCompanyStore();
  const { roleName, isSystemRole, isFetched: permsFetched } = usePermissionsStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || companiesLoading) return;

    if (isSessionExpired && pathname !== '/session-expired') {
      router.replace('/session-expired');
      return;
    }

    // Non connecté → login
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      router.replace('/login');
      return;
    }

    // Connecté sur une page publique → rediriger
    if (isAuthenticated && publicRoutes.includes(pathname)) {
      if (isSuperAdmin) {
        router.replace('/super_admin/dashboard');
      } else if (companies.length === 0) {
        router.replace('/companies');
      } else if (permsFetched) { // On attend les permissions pour savoir où l'envoyer
        const company = activeCompany || companies[0];
        const base = getBasePath(company.business_type?.code || 'SHOP');
        
        if (isSystemRole && roleName === 'Caissier') {
          router.replace(`${base}/pos/shift`);
        } else {
          router.replace(`${base}/dashboard`);
        }
      }
      return;
    }

    // Redirection si le caissier tente d'accéder au dashboard classique
    if (isAuthenticated && !isSuperAdmin && permsFetched && pathname.endsWith('/dashboard')) {
      if (isSystemRole && roleName === 'Caissier') {
        const company = activeCompany || companies[0];
        const base = getBasePath(company.business_type?.code || 'SHOP');
        router.replace(`${base}/pos/shift`);
        return;
      }
    }

    // Super admin sur route non admin
    if (isAuthenticated && isSuperAdmin && !pathname.startsWith('/super_admin') && !publicRoutes.includes(pathname)) {
      router.replace('/super_admin/dashboard');
      return;
    }

    // Non-admin sur route super_admin
    if (isAuthenticated && !isSuperAdmin && pathname.startsWith('/super_admin')) {
      router.replace('/shop/dashboard');
      return;
    }

    // Utilisateur lambda sans entreprise → bloquer sur /companies
    if (
      isAuthenticated &&
      !isSuperAdmin &&
      companies.length === 0 &&
      !noCompanyRoutes.includes(pathname) &&
      !publicRoutes.includes(pathname)
    ) {
      router.replace('/companies');
      return;
    }

    // Contrôle d'accès basé sur les rôles (supprimé car géré par PermissionGuard et RBAC)
  }, [isAuthenticated, isLoading, isSuperAdmin, isSessionExpired, companies, activeCompany, companiesLoading, pathname, router, permsFetched, roleName, isSystemRole]);

  if (isLoading || companiesLoading || (isAuthenticated && !isSuperAdmin && companies.length > 0 && !permsFetched)) {
    return <LoadingScreen variant="fullscreen" message="Chargement" />;
  }

  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  return children;
}