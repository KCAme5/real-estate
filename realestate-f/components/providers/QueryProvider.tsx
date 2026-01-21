'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Properties: cache for 5 minutes, consider stale after 2 minutes
                staleTime: 2 * 60 * 1000, // 2 minutes
                gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
                refetchOnWindowFocus: true,
                refetchOnMount: 'always',
                retry: 1,
            },
            mutations: {
                // Optimistic updates for better UX
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
