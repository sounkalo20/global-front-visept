import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import AuthGuard from '@/components/auth/AuthGuard';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VISEPT',
  description: 'Plateforme de gestion SaaS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthGuard>{children}</AuthGuard>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}