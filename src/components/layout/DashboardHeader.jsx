// components/layout/DashboardHeader.jsx
'use client';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, PanelLeft, ChevronRight, LogOut, Settings, User, Building2, Shield, Search } from 'lucide-react';
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
import ThemeToggle from '@/components/layout/ThemeToggle';
import NotificationBell from '@/components/notifications/NotificationBell';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import useSidebarStore from '@/store/sidebarStore';
import useCommandPaletteStore from '@/store/commandPaletteStore';

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
  const openCommandPalette = useCommandPaletteStore((state) => state.open);
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
    <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-[#374151] bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl transition-colors duration-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="lg:hidden w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-600 dark:text-[#D1D5DB] flex items-center justify-center shrink-0 transition-colors"
            title="Menu"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-600 dark:text-[#D1D5DB] items-center justify-center shrink-0 transition-colors"
            title={isCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
          >
            <PanelLeft size={20} className={isCollapsed ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          <span className="lg:hidden font-bold text-lg text-brand-600 dark:text-brand-400">VISEPT</span>

          {breadcrumb.length > 0 && (
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              {breadcrumb.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight size={14} className="text-gray-300 dark:text-[#9CA3AF]" />}
                  {index === breadcrumb.length - 1 ? (
                    <span className="font-semibold text-gray-900 dark:text-[#F9FAFB]">{crumb.label}</span>
                  ) : (
                    <button
                      onClick={() => router.push(crumb.href)}
                      className="text-gray-500 dark:text-[#D1D5DB] hover:text-gray-900 dark:hover:text-[#F9FAFB] transition-colors"
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

        <div className="flex items-center gap-2.5">
          {/* Bouton Recherche Globale / Command Palette */}
          {!isSuperAdmin && activeCompany && (
            <button
              onClick={openCommandPalette}
              className="flex items-center gap-2 px-3 h-9 text-xs font-medium rounded-xl border border-gray-200 dark:border-[#374151] bg-gray-50/80 dark:bg-[#1F2937]/80 text-gray-500 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-[#F9FAFB] hover:bg-gray-100 dark:hover:bg-[#374151] transition-all shadow-2xs"
              title="Rechercher partout (Ctrl + K)"
            >
              <Search size={14} className="text-gray-400 dark:text-[#9CA3AF]" />
              <span className="hidden sm:inline">Rechercher...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-[#9CA3AF] bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded shadow-2xs">
                Ctrl K
              </kbd>
            </button>
          )}

          {/* Notifications en temps réel */}
          {!isSuperAdmin && activeCompany && <NotificationBell />}

          {/* Bouton de bascule Mode Sombre / Clair */}
          <ThemeToggle />

          {isSuperAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900">
              <Shield size={12} /> Super Admin
            </span>
          )}

          {!isSuperAdmin && activeCompany && (
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-[#D1D5DB] bg-gray-100 dark:bg-[#1F2937] px-2.5 py-1 rounded-full border border-gray-200/60 dark:border-[#374151]">
              {activeCompany.name}
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1F2937]">
                <Avatar className="h-8 w-8 border border-gray-200 dark:border-[#374151]">
                  <AvatarFallback className="text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium text-gray-800 dark:text-[#F9FAFB]">
                  {user?.first_name} {user?.last_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#1F2937] border-gray-200 dark:border-[#374151] shadow-2xl rounded-xl">
              <div className="px-2.5 py-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-[#F9FAFB]">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500 dark:text-[#9CA3AF] truncate">{user?.email}</p>
                {isSuperAdmin && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">🛡️ Super Administrateur</p>
                )}
                {!isSuperAdmin && activeCompany && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1">🏢 {activeCompany.name}</p>
                )}
              </div>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#374151]" />

              <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer text-xs dark:hover:bg-[#374151]">
                <User size={15} className="mr-2 text-gray-500 dark:text-[#9CA3AF]" /> Mon profil
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#374151]" />

              {isSuperAdmin ? (
                <>
                  <DropdownMenuItem onClick={() => router.push('/super_admin/dashboard')} className="cursor-pointer text-xs dark:hover:bg-[#374151]">
                    <Shield size={15} className="mr-2 text-gray-500 dark:text-[#9CA3AF]" /> Tableau de bord
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/super_admin/companies')} className="cursor-pointer text-xs dark:hover:bg-[#374151]">
                    <Building2 size={15} className="mr-2 text-gray-500 dark:text-[#9CA3AF]" /> Entreprises
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  {activeCompany?.my_role !== 'cashier' && (
                    <DropdownMenuItem onClick={() => router.push(`${getBasePath(activeCompany?.business_type?.code || 'SHOP')}/dashboard`)} className="cursor-pointer text-xs dark:hover:bg-[#374151]">
                      <PanelLeft size={15} className="mr-2 text-gray-500 dark:text-[#9CA3AF]" /> Tableau de bord
                    </DropdownMenuItem>
                  )}
                  {activeCompany?.my_role === 'owner' && (
                    <DropdownMenuItem onClick={() => router.push(`${getBasePath(activeCompany?.business_type?.code || 'SHOP')}/companies`)} className="cursor-pointer text-xs dark:hover:bg-[#374151]">
                      <Building2 size={15} className="mr-2 text-gray-500 dark:text-[#9CA3AF]" /> Mes entreprises
                    </DropdownMenuItem>
                  )}
                </>
              )}

              <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#374151]" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-xs text-red-600 dark:text-red-400 dark:hover:bg-red-950/30">
                <LogOut size={15} className="mr-2" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}