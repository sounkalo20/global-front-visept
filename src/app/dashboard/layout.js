'use client';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Sidebar mobile (drawer) */}
      <MobileSidebar />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <DashboardHeader />

        {/* Contenu */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}