// components/layout/DashboardHeader.jsx
'use client';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, PanelLeft, ChevronRight, LogOut, Settings, User, Building2, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import CompanySwitcher from '@/components/companies/CompanySwitcher';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import useSidebarStore from '@/store/sidebarStore';

// Mapping des routes pour le breadcrumb
const pageTitles = {
  // Super admin
  '/super_admin/dashboard': 'Tableau de bord',
  '/super_admin/companies': 'Entreprises',
  '/super_admin/subscriptions': 'Abonnements',
  '/super_admin/payments': 'Paiements',
  '/super_admin/notifications': 'Notifications',
  '/super_admin/audit': 'Journal d\'audit',
  // Shop
  '/shop/dashboard': 'Tableau de bord',
  '/shop/sales': 'Ventes',
  '/shop/expenses': 'Dépenses',
  '/shop/debts': 'Dettes',
  '/shop/products': 'Produits',
  '/shop/categories': 'Catégories',
  '/shop/clients': 'Clients',
  // Restaurant
  '/restaurant/dashboard': 'Tableau de bord',
  '/restaurant/tables': 'Tables',
  '/restaurant/floor-plan': 'Plan de salle',
  '/restaurant/kitchen': 'Suivi cuisine',
  '/restaurant/products': 'Plats & Ingrédients',
  '/restaurant/categories': 'Catégories',
  '/restaurant/sales': 'Ventes',
  '/restaurant/expenses': 'Dépenses',
  '/restaurant/debts': 'Dettes',
  '/restaurant/clients': 'Clients',
  // Commun
  '/shop/companies': 'Entreprises',
  '/restaurant/companies': 'Entreprises',
  '/shop/settings': 'Paramètres',
  '/restaurant/settings': 'Paramètres',
  '/shop/profile': 'Mon profil',
  '/restaurant/profile': 'Mon profil',
};

export default function DashboardHeader() {
  const { user, isSuperAdmin, logout } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const { isCollapsed, toggleCollapsed, toggleMobile } = useSidebarStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user
    ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase()
    : '?';

  const currentPageTitle = pageTitles[pathname] || '';
  const breadcrumbParts = pathname?.split('/').filter(Boolean) || [];
  const breadcrumb = breadcrumbParts.map((part, index) => {
    const href = '/' + breadcrumbParts.slice(0, index + 1).join('/');
    const label = index === breadcrumbParts.length - 1
      ? currentPageTitle
      : pageTitles[href] || part.charAt(0).toUpperCase() + part.slice(1);
    return { href, label };
  }).filter(b => b.label);

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="lg:hidden w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center shrink-0"
            title="Menu"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex w-9 h-9 rounded-lg hover:bg-gray-100 items-center justify-center shrink-0"
            title={isCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
          >
            <PanelLeft size={20} className={isCollapsed ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          <span className="lg:hidden font-bold text-lg text-brand-700">VISEPT</span>

          {breadcrumb.length > 0 && (
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              {breadcrumb.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight size={14} className="text-gray-300" />}
                  {index === breadcrumb.length - 1 ? (
                    <span className="font-medium text-gray-900">{crumb.label}</span>
                  ) : (
                    <button
                      onClick={() => router.push(crumb.href)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {crumb.label}
                    </button>
                  )}
                </span>
              ))}
            </nav>
          )}

          {!isSuperAdmin && (
            <div className="hidden md:block">
              <CompanySwitcher />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              <Shield size={12} /> Super Admin
            </span>
          )}

          {!isSuperAdmin && activeCompany && (
            <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {activeCompany.name}
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                {isSuperAdmin && (
                  <p className="text-xs text-amber-600 mt-1">🛡️ Super Administrateur</p>
                )}
                {!isSuperAdmin && activeCompany && (
                  <p className="text-xs text-brand-600 mt-1">🏢 {activeCompany.name}</p>
                )}
              </div>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User size={16} className="mr-2" /> Mon profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {isSuperAdmin ? (
                <>
                  <DropdownMenuItem onClick={() => router.push('/super_admin/dashboard')}>
                    <Shield size={16} className="mr-2" /> Tableau de bord
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/super_admin/companies')}>
                    <Building2 size={16} className="mr-2" /> Entreprises
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  {activeCompany?.my_role !== 'cashier' && (
                    <DropdownMenuItem onClick={() => router.push(`${getBasePath(activeCompany?.business_type?.code || 'SHOP')}/dashboard`)}>
                      <PanelLeft size={16} className="mr-2" /> Tableau de bord
                    </DropdownMenuItem>
                  )}
                  {activeCompany?.my_role === 'owner' && (
                    <DropdownMenuItem onClick={() => router.push(`${getBasePath(activeCompany?.business_type?.code || 'SHOP')}/companies`)}>
                      <Building2 size={16} className="mr-2" /> Mes entreprises
                    </DropdownMenuItem>
                  )}
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut size={16} className="mr-2" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}