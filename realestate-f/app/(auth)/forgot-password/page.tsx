'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Home, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api') + '/auth/password-reset/',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('If an account exists with this email, you will receive a password reset link shortly.');
            } else {
                setError(data.message || 'Failed to send reset email. Please try again.');
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
                            <div className="text-3xl font-bold text-white">Forgot Password</div>
                            <div className="text-slate-200 mt-1">Enter your email to reset your password</div>
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
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                aria-busy={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Reset Link</span>
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
