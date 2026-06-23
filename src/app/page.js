// app/page.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import { getBasePath } from '@/lib/config/navigation';

export default function Home() {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (isSuperAdmin) {
        router.push('/super_admin/dashboard');
      } else {
        const base = activeCompany
          ? getBasePath(activeCompany.business_type?.code || 'SHOP')
          : '/shop';
        router.push(`${base}/dashboard`);
      }
    }
  }, [isAuthenticated, isLoading, isSuperAdmin, activeCompany, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );
}