// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number = 7) => {
    if (typeof document !== 'undefined') {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
};

// Helper function to delete a cookie
const deleteCookie = (name: string) => {
    if (typeof document !== 'undefined') {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
};

interface User {
    id: number;
    email: string;
    username?: string;
    first_name: string;
    last_name: string;
    user_type: 'client' | 'agent' | 'management';
    phone_number?: string;
    profile_picture?: string;
}

const normalizeProfilePictureUrl = (url?: string) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    if (url.startsWith('/')) return `${origin}${url}`;
    return `${origin}/${url}`;
};

const normalizeUser = (u: any): User => {
    return {
        ...u,
        profile_picture: normalizeProfilePictureUrl(u?.profile_picture),
    };
};

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<any>;
    register: (userData: any) => Promise<any>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateUser: (patch: Partial<User>) => void;
    loading: boolean;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const router = useRouter();

    const handleAutoLogout = useCallback(() => {

        handleLogoutCleanUp();
        router.push('/login');
    }, [router]);

    // Handle redirection after user is set
    useEffect(() => {
        if (shouldRedirect && user) {
    
            const timer = setTimeout(() => {
                if (user.user_type === 'agent') {
                    router.push('/dashboard/agent');
                } else if (user.user_type === 'management') {
                    router.push('/dashboard/management');
                } else {
                    router.push('/dashboard');
                }
                setShouldRedirect(false);
            }, 100); // Small delay to ensure state is fully updated

            return () => clearTimeout(timer);
        }
    }, [shouldRedirect, user, router]);

    useEffect(() => {
        // Register the logout handler
        apiClient.setLogoutHandler(() => {

            handleLogoutCleanUp();
        });

        const initAuth = async () => {
            // Check for access token in localStorage
            const token = localStorage.getItem('accessToken');

            if (token) {
                try {

                    apiClient.setAccessToken(token);
                    // Fetch user profile to validate token and get user details
                    const response = await apiClient.get('/auth/user/');
                    setUser(normalizeUser(response));

                } catch (error) {
                    handleLogoutCleanUp();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [handleAutoLogout]);

    const handleLogoutCleanUp = () => {
        apiClient.setAccessToken(null);
        setUser(null);
        if (typeof window !== 'undefined') {
            // Clear localStorage tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Clear auth cookie
            deleteCookie('auth_token');
        }
    };

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        try {
            apiClient.setAccessToken(token);
            const response = await apiClient.get('/auth/user/');
            setUser(normalizeUser(response));
        } catch (error) {
            // Silent refresh failure
        }
    }, []);

    const updateUser = useCallback((patch: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...patch };
            next.profile_picture = normalizeProfilePictureUrl(next.profile_picture);
            return next;
        });
    }, []);

    const register = async (userData: any) => {
        setLoading(true);
        try {
            const response = await apiClient.post('/auth/register/', userData);

            if (response.success && response.user) {
                // Store tokens in localStorage and cookie
                if (response.access) {
                    localStorage.setItem('accessToken', response.access);
                    apiClient.setAccessToken(response.access);
                    setCookie('auth_token', response.access);
                }
                if (response.refresh) {
                    localStorage.setItem('refreshToken', response.refresh);
                    apiClient.setRefreshToken(response.refresh);
                }
                setUser(normalizeUser(response.user));
                // Trigger redirection via useEffect
                setShouldRedirect(true);
            } else {
                throw new Error('Registration failed');
            }
            return response;
        } catch (error: any) {
            let errorMessage = 'Registration failed.';
            if (error.response?.data?.message) errorMessage = error.response.data.message;
            else if (error.message) errorMessage = error.message;
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {

        setLoading(true);
        try {
            const loginData = { username: email, password: password };
    
            const response = await apiClient.post('/auth/login/', loginData);
    

            if (response.success && response.user) {
                // Store tokens in localStorage and cookie
                if (response.access) {
                    localStorage.setItem('accessToken', response.access);
                    apiClient.setAccessToken(response.access);
                    setCookie('auth_token', response.access);
                }
                if (response.refresh) {
                    localStorage.setItem('refreshToken', response.refresh);
                    apiClient.setRefreshToken(response.refresh);
                }

                setUser(normalizeUser(response.user));


                // Trigger redirection via useEffect
                setShouldRedirect(true);
            } else {
                throw new Error('Login failed');
            }
            return response;
        } catch (error: any) {
            let errorMessage = 'Login failed.';
            if (error.response?.data?.detail) errorMessage = error.response.data.detail;
            else if (error.message) errorMessage = error.message;
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            // Call backend logout
            try {
                await apiClient.post('/auth/logout/', {});
            } catch (e) {
                console.warn('Backend logout error:', e);
            }
        } finally {
            handleLogoutCleanUp();
        }
    };

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
