'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredUserType?: 'client' | 'agent' | 'management';
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    requiredUserType,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push(redirectTo);
        }

        if (!loading && isAuthenticated && requiredUserType && user?.user_type !== requiredUserType) {
            // Redirect if user doesn't have required user type
            router.push('/unauthorized');
        }
    }, [isAuthenticated, loading, user, requiredUserType, router, redirectTo]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-base-content/70">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (requiredUserType && user?.user_type !== requiredUserType) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-error text-lg">Unauthorized Access</div>
                    <p className="mt-2 text-base-content/70">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}