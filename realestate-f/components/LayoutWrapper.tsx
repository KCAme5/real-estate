// components/LayoutWrapper.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();

    // Apply theme class to document element for DaisyUI components if needed
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return <>{children}</>;
}