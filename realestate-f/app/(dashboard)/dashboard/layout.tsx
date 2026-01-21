import DashboardSidebarClient from '@/components/dashboard/DashboardSidebarClient';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-[calc(100vh-5rem)] bg-background flex overflow-hidden">
            <DashboardSidebarClient />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
