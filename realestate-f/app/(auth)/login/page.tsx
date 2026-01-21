'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Home, Building2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login, loading, user } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🔵 Login form submitted', { email: formData.email });
        setError('');

        try {
            console.log('🔵 Calling login function...');
            const response = await login(formData.email, formData.password);
            console.log('🔵 Login response:', response);
            setSuccessMessage('Login successful! Redirecting...');

            // Use the user from response for immediate redirection
            if (response?.user?.user_type === 'management') {
                console.log('🔵 Redirecting to management dashboard');
                router.push('/dashboard/management');
            } else if (response?.user?.user_type === 'agent') {
                console.log('🔵 Redirecting to agent dashboard');
                router.push('/dashboard/agent');
            } else {
                console.log('🔵 Redirecting to client dashboard');
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('🔴 Login error:', err);
            setError(err.message || 'Login failed. Please check your credentials and try again.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSocialLogin = (provider: string) => {
        alert(`${provider} login will be implemented soon!`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Welcome Section */}
                <div className="hidden lg:block space-y-8">
                    <div>
                        <Link href="/register" className="inline-flex items-center gap-3 mb-8 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors"></div>
                                <div className="relative bg-linear-to-br from-primary to-primary/80 text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                                    <Home className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="group-hover:translate-x-1 transition-transform">
                                <div className="text-3xl font-bold text-foreground">Welcome</div>
                                <div className="text-muted-foreground mt-1">Sign in to your account/signup </div>
                            </div>
                        </Link>
                    </div>

                    {/* Features */}
                    <div className="space-y-6">
                        {[
                            {
                                icon: <Building2 className="w-5 h-5" />,
                                title: 'Access Premium Listings',
                                description: 'Browse exclusive properties with virtual tours and detailed analytics'
                            },
                            {
                                icon: <ShieldCheck className="w-5 h-5" />,
                                title: 'Secure Transactions',
                                description: 'Bank-level security for all your property transactions'
                            },
                            {
                                icon: <Eye className="w-5 h-5" />,
                                title: 'Personalized Experience',
                                description: 'Get property recommendations based on your preferences'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-start gap-4 group">
                                <div className="shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
                        {[
                            { number: '300+', label: 'Properties' },
                            { number: '98%', label: 'Satisfaction' },
                            { number: '24/7', label: 'Support' }
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl font-bold text-primary">{stat.number}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Login Form */}
                <div className="relative">

                    <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                        {/* Form Header */}
                        <div className="p-8 border-b border-border bg-linear-to-r from-primary/5 via-transparent to-transparent">
                            <h2 className="text-3xl font-bold text-foreground">Sign in to your account</h2>
                            <p className="text-muted-foreground mt-2">
                                Enter your credentials to access your dashboard
                            </p>
                        </div>

                        <div className="p-8">
                            {/* Success Message */}
                            {successMessage && (
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl animate-in slide-in-from-top-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="font-medium">{successMessage}</span>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                                            <span className="text-sm font-bold">!</span>
                                        </div>
                                        <span className="font-medium">{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
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
                                            autoComplete="username"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-12 py-3.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            placeholder="Enter your password"
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

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                checked={formData.rememberMe}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-5 h-5 border-2 border-input rounded-md peer-checked:border-primary peer-checked:bg-primary transition-colors group-hover:border-primary/50">
                                                {formData.rememberMe && (
                                                    <svg className="w-4 h-4 mx-auto mt-0.5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                            Remember me
                                        </span>
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="my-8 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-card text-muted-foreground font-medium">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin('google')}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-background border border-input hover:border-primary/30 hover:bg-accent text-foreground font-medium rounded-xl transition-all duration-300 group"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>
                            </div>

                            {/* Register Link */}
                            <div className="mt-8 text-center">
                                <p className="text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link
                                        href="/register"
                                        className="font-semibold text-primary hover:text-primary/80 transition-colors group inline-flex items-center gap-1"
                                    >
                                        Create an account
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="mt-6 text-center">
                        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Your data is securely protected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}