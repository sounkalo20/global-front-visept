'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SidebarSection({ title, children, collapsed }) {
  return (
    <div className="mb-2">
      {!collapsed && title && (
        <motion.p
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
        >
          {title}
        </motion.p>
      )}
      {collapsed && title && (
        <div className="px-3 py-2">
          <div className="h-px bg-gray-200" />
        </div>
      )}
      <div className={cn('space-y-0.5', collapsed && 'flex flex-col items-center')}>
        {children}
      </div>
    </div>
  );
}