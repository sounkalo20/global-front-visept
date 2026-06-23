// app/super_admin/layout.jsx
'use client';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default function SuperAdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <MobileSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader />
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}