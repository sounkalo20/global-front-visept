// components/layout/MobileSidebar.jsx
'use client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import useSidebarStore from '@/store/sidebarStore';
import useAuthStore from '@/store/authStore';
import useNavigation from '@/hooks/useNavigation';

export default function MobileSidebar() {
    const { isMobileOpen, setMobileOpen } = useSidebarStore();
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const navigation = useNavigation();

    const handleLogout = () => {
        logout();
        router.push('/login');
        setMobileOpen(false);
    };

    return (
        <AnimatePresence>
            {isMobileOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-40 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />

                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-[#374151] z-50 lg:hidden flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-[#374151]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-xs">
                                    <span className="text-white font-bold text-sm">V</span>
                                </div>
                                <span className="font-bold text-lg text-gray-900 dark:text-[#F9FAFB]">VISEPT</span>
                            </div>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-500 dark:text-[#9CA3AF] flex items-center justify-center transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#374151] bg-gray-50 dark:bg-[#1F2937]/50">
                            <p className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500 dark:text-[#9CA3AF] truncate">{user?.email}</p>
                        </div>

                        {/* Navigation dynamique */}
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
                        <div className="border-t border-gray-200 dark:border-[#374151] p-3 space-y-1">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
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