// app/layout.jsx
'use client';
import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import AuthGuard from '@/components/auth/AuthGuard';
import useAuthStore from '@/store/authStore';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthGuard>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthGuard>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}