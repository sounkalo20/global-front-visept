'use client';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function ThemeToggle({ className = '' }) {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 ${className}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`relative w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 transition-all duration-200 shadow-xs ${className}`}
              aria-label="Changer de thème"
            >
              {/* Icône Soleil (visible en mode clair) */}
              <Sun
                size={18}
                className={`transition-all duration-300 text-amber-500 ${
                  isDark ? 'scale-0 rotate-90 opacity-0 absolute' : 'scale-100 rotate-0 opacity-100'
                }`}
              />
              {/* Icône Lune (visible en mode sombre) */}
              <Moon
                size={18}
                className={`transition-all duration-300 text-indigo-400 ${
                  isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0 absolute'
                }`}
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Thème : {theme === 'system' ? 'Système (Auto)' : theme === 'dark' ? 'Sombre' : 'Clair'}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-xl rounded-xl p-1">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer transition-colors ${
            theme === 'light'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-semibold'
              : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sun size={15} className="text-amber-500" />
            <span>Clair</span>
          </div>
          {theme === 'light' && <Check size={14} className="text-brand-600 dark:text-brand-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer transition-colors ${
            theme === 'dark'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-semibold'
              : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <Moon size={15} className="text-indigo-400" />
            <span>Sombre</span>
          </div>
          {theme === 'dark' && <Check size={14} className="text-brand-600 dark:text-brand-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer transition-colors ${
            theme === 'system'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-semibold'
              : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <Laptop size={15} className="text-gray-400 dark:text-slate-400" />
            <span>Système (Auto)</span>
          </div>
          {theme === 'system' && <Check size={14} className="text-brand-600 dark:text-brand-400" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
