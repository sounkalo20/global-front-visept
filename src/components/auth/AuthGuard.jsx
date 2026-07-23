// components/auth/AuthGuard.jsx
'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import { getBasePath } from '@/lib/config/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

const publicRoutes = ['/login', '/register', '/session-expired'];
const noCompanyRoutes = ['/companies', '/companies/new'];

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, isSuperAdmin, isSessionExpired } = useAuthStore();
  const { activeCompany, companies, isLoading: companiesLoading } = useCompanyStore();
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
      } else {
        const company = activeCompany || companies[0];
        const base = getBasePath(company.business_type?.code || 'SHOP');
        router.replace(`${base}/dashboard`);
      }
      return;
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

    // Contrôle d'accès basé sur les rôles
    if (isAuthenticated && !isSuperAdmin && activeCompany && !publicRoutes.includes(pathname)) {
      const role = activeCompany.my_role;
      const base = getBasePath(activeCompany.business_type?.code || 'SHOP');
      const isDashboard = pathname.endsWith('/dashboard');
      const isCompanies = pathname.endsWith('/companies') || pathname === '/companies';
      const isSettings = pathname.includes('/settings');
      const isEmployees = pathname.includes('/employees');

      if (role === 'cashier' && (isDashboard || isCompanies || isSettings || isEmployees)) {
        router.replace(`${base}/sales/new`);
        return;
      }

      if (role === 'manager' && isCompanies) {
        router.replace(`${base}/dashboard`);
        return;
      }
    }
  }, [isAuthenticated, isLoading, isSuperAdmin, isSessionExpired, companies, activeCompany, companiesLoading, pathname, router]);

  if (isLoading || companiesLoading) {
    return <LoadingScreen variant="fullscreen" message="Chargement" />;
  }

  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  return children;
}