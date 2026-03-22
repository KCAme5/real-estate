// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

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

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<any>;
    register: (userData: any) => Promise<any>;
    logout: () => Promise<void>;
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
        console.log('🔴 Auto-logout triggered due to authentication failure');
        handleLogoutCleanUp();
        router.push('/login');
    }, [router]);

    // Handle redirection after user is set
    useEffect(() => {
        if (shouldRedirect && user) {
            console.log('🟢 Redirecting user based on type:', user.user_type);
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
            console.log('Session expired, logging out...');
            handleLogoutCleanUp();
        });

        const initAuth = async () => {
            // Check for access token in localStorage
            const token = localStorage.getItem('accessToken');

            if (token) {
                try {
                    console.log('🔵 Found existing token, attempting to restore session...');
                    apiClient.setAccessToken(token);
                    // Fetch user profile to validate token and get user details
                    const response = await apiClient.get('/auth/user/');
                    setUser(response);
                    console.log('🟢 Session restored:', response);
                } catch (error) {
                    console.error('🔴 Failed to restore session:', error);
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
        }
    };

    const register = async (userData: any) => {
        setLoading(true);
        try {
            const response = await apiClient.post('/auth/register/', userData);

            if (response.success && response.user) {
                // Store tokens in localStorage
                if (response.access) {
                    localStorage.setItem('accessToken', response.access);
                    apiClient.setAccessToken(response.access);
                }
                if (response.refresh) {
                    localStorage.setItem('refreshToken', response.refresh);
                    apiClient.setRefreshToken(response.refresh);
                }
                setUser(response.user);
                // Trigger redirection via useEffect
                setShouldRedirect(true);
            } else {
                throw new Error('Registration failed');
            }
            return response;
        } catch (error: any) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed.';
            if (error.response?.data?.message) errorMessage = error.response.data.message;
            else if (error.message) errorMessage = error.message;
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        console.log('🟢 AuthContext login called', { email });
        setLoading(true);
        try {
            const loginData = { username: email, password: password };
            console.log('🟢 Sending POST to /auth/login/ with:', { username: email });
            const response = await apiClient.post('/auth/login/', loginData);
            console.log('🟢 Login API response:', response);

            if (response.success && response.user) {
                // Store tokens in localStorage
                if (response.access) {
                    localStorage.setItem('accessToken', response.access);
                    apiClient.setAccessToken(response.access);
                }
                if (response.refresh) {
                    localStorage.setItem('refreshToken', response.refresh);
                    apiClient.setRefreshToken(response.refresh);
                }
                
                setUser(response.user);
                console.log('🟢 User set:', response.user);
                
                // Trigger redirection via useEffect
                setShouldRedirect(true);
            } else {
                throw new Error('Login failed');
            }
            return response;
        } catch (error: any) {
            console.error('🔴 AuthContext login error:', error);
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
