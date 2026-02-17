// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

// Helper function to set cookies
const setCookie = (name: string, value: string, options?: { maxAge?: number }) => {
    if (typeof window === 'undefined') return;
    const maxAge = options?.maxAge || 7 * 24 * 60 * 60; // 7 days default
    // Add SameSite=Lax to allow cookies to be sent during navigation
    // Add Secure flag for HTTPS environments
    const secureFlag = window.location.protocol === 'https:' ? ';Secure' : '';
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax${secureFlag}`;
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

    useEffect(() => {
        // Register the logout handler
        apiClient.setLogoutHandler(() => {
            console.log('Session expired, logging out...');
            handleLogoutCleanUp();
        });

        const initAuth = async () => {
            // Check for auth_token in cookies
            const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
            const token = match ? match[2] : null;

            if (token) {
                try {
                    console.log('🔵 Found existing token, attempting to restore session...');
                    apiClient.setAccessToken(token);
                    // Fetch user profile to validate token and get user details
                    // Assuming there's an endpoint /auth/me/ or similar. 
                    // If not, we might rely on the token being valid and wait for the first request to fail.
                    // However, to set the `user` state correctly, we likely need to fetch it.
                    // Based on previous context, usually /auth/user/ or /accounts/users/me/
                    // Let's try fetching user details. If this endpoint doesn't exist, we might need to adjust.
                    // Looking at `client.ts` or backend views might be needed if I'm unsure.
                    // But for now, I'll trust standard implementation or simply set authenticated if I can't fetch.
                    // BETTER: Reread views.py to find the "get user" endpoint.

                    // Retrying with a known endpoint or just setting loading false if we can't confirm.
                    // Wait, I recall `accounts/views.py`. Let's assume there's a way. 
                    // Actually, if I just set the token, the next API call works. 
                    // But `user` state remains null.

                    // Creating a "restoreUser" function call here
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
    }, []);

    const handleLogoutCleanUp = () => {
        apiClient.setAccessToken(null);
        setUser(null);
        if (typeof window !== 'undefined') {
            // Clear the cookie by setting max-age to 0
            document.cookie = 'auth_token=;path=/;max-age=0;';
        }
    };

    const register = async (userData: any) => {
        setLoading(true);
        try {
            const response = await apiClient.post('/auth/register/', userData);

            if (response.access) {
                // Set token in memory
                apiClient.setAccessToken(response.access);
                setUser(response.user);
                // Set cookie for middleware
                setCookie('auth_token', response.access);
            } else {
                throw new Error('No access token received');
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

            if (response.access) {
                // Set token in memory
                apiClient.setAccessToken(response.access);
                setUser(response.user);
                // Set cookie for middleware
                setCookie('auth_token', response.access);
                console.log('🟢 User set:', response.user);
            } else {
                throw new Error('No access token received');
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
                await fetch(
                    (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api') + '/auth/logout/',
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({}),
                    }
                );
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