'use client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Menu, PanelLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User, Building2 } from 'lucide-react';
import CompanySwitcher from '@/components/companies/CompanySwitcher';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import useSidebarStore from '@/store/sidebarStore';

// Mapping des routes pour le breadcrumb
const pageTitles = {
  '/dashboard': 'Tableau de bord',
  '/dashboard/sales': 'Ventes',
  '/dashboard/expenses': 'Dépenses',
  '/dashboard/debts': 'Dettes',
  '/dashboard/products': 'Produits',
  '/dashboard/categories': 'Catégories',
  '/dashboard/clients': 'Clients',
  '/companies': 'Entreprises',
  '/dashboard/settings': 'Paramètres',
  '/dashboard/profile': 'Mon profil',
};

export default function DashboardHeader() {
  const { user, logout } = useAuthStore();
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

  // Trouver le titre de la page actuelle
  const currentPageTitle = pageTitles[pathname] || '';

  // Construire le breadcrumb
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
          {/* Bouton hamburger mobile */}
          <button
            onClick={toggleMobile}
            className="lg:hidden w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center shrink-0"
            title="Menu"
          >
            <Menu size={20} />
          </button>

          {/* Bouton collapse desktop */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex w-9 h-9 rounded-lg hover:bg-gray-100 items-center justify-center shrink-0"
            title={isCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
          >
            <PanelLeft size={20} className={isCollapsed ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {/* Logo mobile */}
          <span className="lg:hidden font-bold text-lg text-brand-700">VISEPT</span>

          {/* Breadcrumb */}
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

          {/* Company switcher */}
          <div className="hidden md:block">
            <CompanySwitcher />
          </div>
        </div>

        {/* Profil utilisateur */}
        <div className="flex items-center gap-2">
          {activeCompany && (
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
                {activeCompany && (
                  <p className="text-xs text-brand-600 mt-1">🏢 {activeCompany.name}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                <User size={16} className="mr-2" /> Tableau de bord
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User size={16} className="mr-2" /> Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/companies')}>
                <Building2 size={16} className="mr-2" /> Mes entreprises
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings size={16} className="mr-2" /> Paramètres
              </DropdownMenuItem>
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