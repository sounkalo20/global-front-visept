// app/layout.js
'use client';
import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import AuthGuard from '@/components/auth/AuthGuard';
import useAuthStore from '@/store/authStore';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Composant Toaster synchronisé avec le thème actif
function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="top-right" richColors theme={resolvedTheme} />;
}

export default function RootLayout({ children }) {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('visept_theme');
                  var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0B0F14] dark:text-[#F9FAFB] transition-colors duration-200 antialiased`}>
        <ThemeProvider defaultTheme="system">
          <AuthGuard>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AuthGuard>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}