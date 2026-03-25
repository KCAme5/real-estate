// app/(dashboard)/layout.tsx

export const metadata = {
    title: 'Dashboard - KenyaPrime Properties',
    description: 'Your personal dashboard',
};

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
    // Server component that provides metadata and layout structure
    // Individual dashboard pages handle their own layout and styling
    return children;
}