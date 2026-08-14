'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const barVariants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.04, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const dotVariants = {
  animate: (i) => ({
    y: [0, -6, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'loop',
      delay: i * 0.15,
      ease: 'easeInOut',
    },
  }),
};

/**
 * LoadingScreen — Composant de chargement réutilisable
 *
 * @param {'fullscreen' | 'inline' | 'overlay'} variant
 *   - fullscreen : prend toute la page
 *   - inline     : s'intègre dans un conteneur (hauteur auto)
 *   - overlay    : surcouche semi-transparente avec backdrop-blur
 * @param {string} message — texte affiché sous le loader
 * @param {boolean} show — contrôle la visibilité (pour AnimatePresence)
 */
export default function LoadingScreen({
  variant = 'fullscreen',
  message = 'Chargement...',
  show = true,
}) {
  const wrapperClasses = {
    fullscreen: 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0B0F14]',
    inline: 'flex flex-col items-center justify-center py-20',
    overlay: 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-[#0B0F14]/80 backdrop-blur-xl',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(wrapperClasses[variant])}
        >
          {/* Logo animé */}
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="mb-6"
          >
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-[#F9FAFB] select-none">
              VISEPT
            </span>
          </motion.div>

          {/* Barre de progression animée */}
          <div className="relative w-48 h-1 bg-gray-200 dark:bg-[#374151] rounded-full overflow-hidden mb-5">
            <motion.div
              variants={barVariants}
              animate="animate"
              className="absolute inset-y-0 w-1/2 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #6366F1, #4F46E5, transparent)',
              }}
            />
          </div>

          {/* Message + dots animés */}
          <div className="flex items-center gap-0.5">
            <span className="text-sm text-gray-500 dark:text-[#D1D5DB] font-medium">{message}</span>
            <span className="flex ml-0.5 gap-px">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={dotVariants}
                  animate="animate"
                  className="w-1 h-1 rounded-full bg-brand-500 dark:bg-brand-400 inline-block"
                />
              ))}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
