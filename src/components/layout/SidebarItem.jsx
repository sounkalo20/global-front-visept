'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SidebarItem({ href, icon: Icon, label, collapsed, badge, onClick }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

    const content = (
        <>
            <Icon
                size={20}
                className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-[#9CA3AF] group-hover:text-gray-700 dark:group-hover:text-[#F9FAFB]'
                )}
            />
            {!collapsed && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 text-left truncate"
                >
                    {label}
                </motion.span>
            )}
            {badge && !collapsed && (
                <span className="text-xs bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-medium">
                    {badge}
                </span>
            )}
            {isActive && collapsed && (
                <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-0 w-1 h-6 bg-brand-600 dark:bg-brand-400 rounded-l-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
        </>
    );

    const buttonClass = cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative',
        isActive
            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold shadow-xs'
            : 'text-gray-600 dark:text-[#D1D5DB] hover:bg-gray-100 dark:hover:bg-[#1F2937] hover:text-gray-900 dark:hover:text-[#F9FAFB]'
    );

    if (!href) {
        return (
            <button
                onClick={onClick}
                className={buttonClass}
                title={collapsed ? label : undefined}
            >
                {content}
            </button>
        );
    }

    return (
        <Link
            href={href}
            onClick={onClick}
            className={buttonClass}
            title={collapsed ? label : undefined}
        >
            {content}
        </Link>
    );
}