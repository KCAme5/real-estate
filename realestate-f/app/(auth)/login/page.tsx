'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Home, Building2, ShieldCheck } from 'lucide-react';

const heroImages = [
    {
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920',
        alt: 'Modern Kenyan family home'
    },
    {
        url: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1984&q=80',
        alt: 'African family in beautiful home'
    },
    {
        url: 'https://cdn.home-designing.com/wp-content/uploads/2015/09/cool-home-exterior1-1024x576.jpg',
        alt: 'Luxury villa with pool'
    },
    {
        url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=2065&q=80',
        alt: 'Modern apartment building'
    },
    {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        alt: 'Cozy living room interior'
    }
];

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [imageError, setImageError] = useState<number | null>(null);
    const { login, loading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const validateForm = () => {
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password should be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        try {
            const response = await login(formData.email, formData.password);
            setSuccessMessage('Login successful! Redirecting...');

            // Use the user from response for immediate redirection
            if (response?.user?.user_type === 'management') {
                router.push('/dashboard/management');
            } else if (response?.user?.user_type === 'agent') {
                router.push('/dashboard/agent');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
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

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
                {heroImages.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {imageError === index ? (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <div className="text-center text-slate-100">
                                    <p className="text-lg">Image not available</p>
                                </div>
                            </div>
                        ) : (
                            <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-full object-cover"
                                onError={() => setImageError(index)}
                            />
                        )}
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="hidden lg:block space-y-8 text-white">
                        <div>
                            <Link href="/register" className="inline-flex items-center gap-3 mb-8 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl group-hover:bg-emerald-400/40 transition-colors"></div>
                                    <div className="relative bg-linear-to-br from-emerald-500 to-emerald-400 text-slate-950 w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                                        <Home className="w-7 h-7" />
                                    </div>
                                </div>
                                <div className="group-hover:translate-x-1 transition-transform">
                                    <div className="text-3xl font-bold">Welcome back</div>
                                    <div className="text-slate-200 mt-1">Sign in to your account or create a new one</div>
                                </div>
                            </Link>
                        </div>

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
                                    <div className="shrink-0 w-12 h-12 bg-emerald-500/10 text-emerald-300 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold group-hover:text-emerald-300 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-slate-200/80 mt-1">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                            {[
                                { number: '300+', label: 'Properties' },
                                { number: '98%', label: 'Satisfaction' },
                                { number: '24/7', label: 'Support' }
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-2xl font-bold text-emerald-400">{stat.number}</div>
                                    <div className="text-xs text-slate-200 uppercase tracking-wider mt-1">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-slate-950/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                            <div className="p-8 border-b border-white/10 bg-slate-900/60">
                                <h2 className="text-3xl font-bold text-white">Sign in to your account</h2>
                                <p className="text-slate-300 mt-2">
                                    Enter your credentials to access your dashboard
                                </p>
                            </div>

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
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                                            className="w-full pl-12 pr-12 py-3.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                                            <div className="w-5 h-5 border-2 border-slate-600 rounded-md peer-checked:border-emerald-500 peer-checked:bg-emerald-500 transition-colors group-hover:border-emerald-400/70">
                                                {formData.rememberMe && (
                                                    <svg className="w-4 h-4 mx-auto mt-0.5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-slate-100 group-hover:text-emerald-300 transition-colors">
                                            Remember me
                                        </span>
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                    aria-busy={loading}
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

                                <div className="mt-8 text-center">
                                    <p className="text-slate-300">
                                        Don't have an account?{' '}
                                        <Link
                                            href="/register"
                                            className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group inline-flex items-center gap-1"
                                        >
                                            Create an account
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </p>
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
            </div>
        </div>
    );
}
