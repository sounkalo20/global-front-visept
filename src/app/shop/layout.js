'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import CommandPalette from '@/components/common/CommandPalette';

export default function ShopLayout({ children }) {
  const pathname = usePathname();
  const isPosRoute = pathname.includes('/sales/new') || pathname.match(/\/sales\/.*\/edit/) || pathname.includes('/pos/');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service Worker registration skipped:', err);
      });
    }
  }, []);

  if (isPosRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <CommandPalette />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}