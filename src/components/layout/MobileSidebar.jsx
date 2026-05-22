'use client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    LayoutDashboard,
    ShoppingCart,
    Receipt,
    DollarSign,
    Package,
    FolderTree,
    Users,
    Building2,
    Settings,
    User,
    LogOut,
} from 'lucide-react';
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import useSidebarStore from '@/store/sidebarStore';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function MobileSidebar() {
    const { isMobileOpen, setMobileOpen } = useSidebarStore();
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
        setMobileOpen(false);
    };

    const navigation = [
        {
            section: 'Général',
            items: [
                { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            ],
        },
        {
            section: 'Finance',
            items: [
                { href: '/dashboard/sales', label: 'Ventes', icon: ShoppingCart },
                { href: '/dashboard/expenses', label: 'Dépenses', icon: Receipt },
                { href: '/dashboard/debts', label: 'Dettes', icon: DollarSign },
            ],
        },
        {
            section: 'Inventaire',
            items: [
                { href: '/dashboard/products', label: 'Produits', icon: Package },
                { href: '/dashboard/categories', label: 'Catégories', icon: FolderTree },
            ],
        },
        {
            section: 'CRM',
            items: [
                { href: '/dashboard/clients', label: 'Clients', icon: Users },
            ],
        },
        {
            section: 'Entreprise',
            items: [
                { href: '/dashboard/companies', label: 'Entreprises', icon: Building2 },
                // { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
            ],
        },
    ];

    return (
        <AnimatePresence>
            {isMobileOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />

                    {/* Drawer */}
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between h-16 px-4 border-b">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">V</span>
                                </div>
                                <span className="font-bold text-lg text-gray-900">VISEPT</span>
                            </div>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* User info */}
                        <div className="px-4 py-3 border-b bg-gray-50">
                            <p className="font-medium text-sm">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
                            {navigation.map((section) => (
                                <SidebarSection key={section.section} title={section.section}>
                                    {section.items.map((item) => (
                                        <SidebarItem
                                            key={item.href}
                                            href={item.href}
                                            icon={item.icon}
                                            label={item.label}
                                            onClick={() => setMobileOpen(false)}
                                        />
                                    ))}
                                </SidebarSection>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="border-t p-3 space-y-1">
                            {/* <SidebarItem
                                href="/dashboard/profile"
                                icon={User}
                                label="Mon profil"
                                onClick={() => setMobileOpen(false)}
                            /> */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={20} />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}