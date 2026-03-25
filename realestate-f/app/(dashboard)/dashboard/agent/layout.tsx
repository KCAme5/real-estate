// app/(dashboard)/dashboard/agent/layout.tsx

export default function AgentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // We already have the sidebar in the page components
    // and a global layout in (dashboard)/layout.tsx
    // Returning children directly to avoid sidebar duplication
    return <>{children}</>;
}