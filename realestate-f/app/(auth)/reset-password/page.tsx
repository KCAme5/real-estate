'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight, Home, ShieldCheck, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError('Invalid or missing reset token');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password.length < 6) {
            setError('Password should be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api') + '/auth/password-reset-confirm/',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, new_password: password }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Password reset successful! Redirecting to login...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password. Please try again.');
            }
        } catch (err: any) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
            <div className="relative z-10 w-full max-w-md px-4 py-12">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl group-hover:bg-emerald-400/40 transition-colors"></div>
                            <div className="relative bg-linear-to-br from-emerald-500 to-emerald-400 text-slate-950 w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                                <Home className="w-7 h-7" />
                            </div>
                        </div>
                        <div className="group-hover:translate-x-1 transition-transform">
                            <div className="text-3xl font-bold text-white">Reset Password</div>
                            <div className="text-slate-200 mt-1">Enter your new password</div>
                        </div>
                    </Link>
                </div>

                <div className="bg-slate-950/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                    <div className="p-8">
                        {successMessage && (
                            <div
                                className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl"
                                role="status"
                                aria-live="polite"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="font-medium">{successMessage}</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl"
                                role="alert"
                                aria-live="assertive"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <span className="text-sm font-bold">!</span>
                                    </div>
                                    <span className="font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                aria-busy={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                        <span>Resetting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Reset Password</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 text-xs text-slate-300">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Your data is securely protected</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
                <div className="relative z-10 w-full max-w-md px-4 py-12">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl"></div>
                                <div className="relative bg-linear-to-br from-emerald-500 to-emerald-400 text-slate-950 w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                                    <Home className="w-7 h-7" />
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">Reset Password</div>
                                <div className="text-slate-200 mt-1">Loading...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
