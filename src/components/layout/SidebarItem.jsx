'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SidebarItem({ href, icon: Icon, label, collapsed, badge, onClick }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group',
                    isActive
                        ? 'bg-brand-50 text-brand-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                title={collapsed ? label : undefined}
            >
                <Icon
                    size={20}
                    className={cn(
                        'shrink-0 transition-colors',
                        isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'
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
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                        {badge}
                    </span>
                )}
                {isActive && collapsed && (
                    <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute right-0 w-1 h-6 bg-brand-600 rounded-l-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
            </button>
        );
    }

    return (
        <Link
            href={href}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative',
                isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
            title={collapsed ? label : undefined}
        >
            <Icon
                size={20}
                className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'
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
                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                    {badge}
                </span>
            )}
            {isActive && collapsed && (
                <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-0 w-1 h-6 bg-brand-600 rounded-l-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
        </Link>
    );
}