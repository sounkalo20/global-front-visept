// components/layout/Sidebar.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import useSidebarStore from '@/store/sidebarStore';
import useAuthStore from '@/store/authStore';
import useNavigation from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';

export default function Sidebar() {
    const { isCollapsed, toggleCollapsed, init } = useSidebarStore();
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const navigation = useNavigation();

    useEffect(() => {
        init();
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
                'hidden lg:flex flex-col h-screen sticky top-0 border-r border-gray-200 dark:border-[#374151] bg-white/95 dark:bg-[#111827] backdrop-blur-xl z-30 shrink-0 transition-colors duration-200'
            )}
        >
            {/* Logo */}
            <div className={cn(
                'flex items-center h-16 border-b border-gray-200 dark:border-[#374151] px-4',
                isCollapsed ? 'justify-center' : 'justify-between'
            )}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2.5"
                    >
                        <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-xs">
                            <span className="text-white font-bold text-sm">V</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900 dark:text-[#F9FAFB]">VISEPT</span>
                    </motion.div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-xs">
                        <span className="text-white font-bold text-sm">V</span>
                    </div>
                )}
                <button
                    onClick={toggleCollapsed}
                    className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-500 dark:text-[#9CA3AF] transition-colors shrink-0"
                    title={isCollapsed ? 'Agrandir' : 'Réduire'}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation dynamique */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 [&::-webkit-scrollbar]:hidden">
                {navigation.map((section) => (
                    <SidebarSection key={section.section} title={section.section} collapsed={isCollapsed}>
                        {section.items.map((item) => (
                            <SidebarItem
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                collapsed={isCollapsed}
                            />
                        ))}
                    </SidebarSection>
                ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-[#374151] p-3 space-y-1">
                <button
                    onClick={handleLogout}
                    className={cn(
                        'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors',
                        isCollapsed && 'justify-center px-0'
                    )}
                    title={isCollapsed ? 'Déconnexion' : undefined}
                >
                    <LogOut size={18} className="shrink-0" />
                    {!isCollapsed && <span>Déconnexion</span>}
                </button>
            </div>
        </motion.aside>
    );
}