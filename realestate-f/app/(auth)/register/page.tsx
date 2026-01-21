// app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    User,
    Briefcase,
    ArrowRight,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Phone,
    User as UserIcon,
    Home,
    ShieldCheck,
    Building2,
    Award,
    Users,
    BriefcaseBusiness
} from 'lucide-react';

type UserType = 'client' | 'agent' | null;

export default function RegistrationPage() {
    const [userType, setUserType] = useState<UserType>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const { register, loading } = useAuth();
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password2: '',
        user_type: 'client' as 'client' | 'agent',
        license_number: '',
        agency_name: '',
        years_of_experience: '',
        specialization: '',
        bio: '',
        agreeToTerms: false,
    });

    // Update user type when selected
    useEffect(() => {
        if (userType) {
            setFormData(prev => ({ ...prev, user_type: userType }));
        }
    }, [userType]);

    const handleUserTypeSelect = (type: UserType) => {
        setUserType(type);
        setStep(2);
        // Scroll to form smoothly
        setTimeout(() => {
            document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: (e.target as HTMLInputElement).checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Frontend validation
        if (formData.password !== formData.password2) {
            setError("Passwords don't match");
            return;
        }

        if (!formData.agreeToTerms) {
            setError('You must agree to the Terms and Conditions');
            return;
        }

        try {
            // Prepare submission data - DO NOT remove password2 
            // Only remove agreeToTerms since backend doesn't need it
            const { agreeToTerms, ...submitData } = formData;

            // Make sure password2 is included
            if (!submitData.password2) {
                submitData.password2 = submitData.password;
            }

            console.log('Submitting registration data:', submitData);

            await register(submitData);

            // Show success message
            setSuccessMessage('Registration successful! Welcome to KenyaPrime Properties. Redirecting you to dashboard...');

            // Redirect based on user type after a short delay
            setTimeout(() => {
                if (formData.user_type === 'agent') {
                    router.push('/dashboard/agent');
                } else {
                    router.push('/dashboard');
                }
            }, 2000);
        } catch (err: any) {
            console.error('Registration error details:', err);

            // Parse error message from backend
            let errorMessage = 'Registration failed. Please try again.';

            if (err.message) {
                try {
                    // Try to parse JSON error if it exists
                    const errorData = JSON.parse(err.message);
                    if (errorData.formatted_message) {
                        errorMessage = errorData.formatted_message;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.errors) {
                        // Format field-specific errors
                        const errorList = Object.entries(errorData.errors)
                            .map(([field, error]) => `${field}: ${error}`)
                            .join(' • ');
                        errorMessage = `Please fix the following: ${errorList}`;
                    }
                } catch {
                    // If not JSON, use the message directly
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
        }
    };

    const goBack = () => {
        if (step === 2) {
            setStep(1);
            setUserType(null);
            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Benefits based on user type
    const clientBenefits = [
        { icon: <Home className="w-4 h-4" />, text: 'Access thousands of verified properties' },
        { icon: <Building2 className="w-4 h-4" />, text: 'Virtual tours and detailed property insights' },
        { icon: <Users className="w-4 h-4" />, text: 'Connect with trusted real estate agents' },
        { icon: <ShieldCheck className="w-4 h-4" />, text: 'Secure transaction process' },
    ];

    const agentBenefits = [
        { icon: <BriefcaseBusiness className="w-4 h-4" />, text: 'List unlimited properties' },
        { icon: <Users className="w-4 h-4" />, text: 'Access qualified leads and buyers' },
        { icon: <Award className="w-4 h-4" />, text: 'Professional dashboard and tools' },
        { icon: <Building2 className="w-4 h-4" />, text: 'Market analytics and insights' },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back to Home */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Join KenyaPrime Properties
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Start your real estate journey with Kenya's premier property platform
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex items-center justify-center gap-8">
                        <div className={`flex items-center gap-3 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                1
                            </div>
                            <span className="font-medium">Choose Account Type</span>
                        </div>
                        <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-primary' : 'bg-border'}`}></div>
                        <div className={`flex items-center gap-3 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                2
                            </div>
                            <span className="font-medium">Create Account</span>
                        </div>
                    </div>
                </div>

                {/* Step 1: User Type Selection */}
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Client Card */}
                        <div className="group">
                            <div
                                onClick={() => handleUserTypeSelect('client')}
                                className="bg-card border-2 border-border hover:border-primary hover:shadow-xl rounded-2xl p-8 cursor-pointer transition-all duration-300 h-full flex flex-col"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-16 h-16 bg-linear-to-br from-primary/20 to-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-foreground mb-4">
                                        I'm a Client
                                    </h3>
                                    <p className="text-muted-foreground mb-6 leading-relaxed">
                                        Looking to buy, rent, or invest in properties. Get access to thousands of verified listings and expert guidance.
                                    </p>

                                    <div className="space-y-3">
                                        {clientBenefits.map((benefit, index) => (
                                            <div key={index} className="flex items-center gap-3 text-foreground">
                                                <div className="w-5 h-5 bg-primary/10 text-primary rounded flex items-center justify-center">
                                                    {benefit.icon}
                                                </div>
                                                <span className="text-sm">{benefit.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border">
                                    <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-xl font-semibold transition-all duration-300 group-hover:scale-105">
                                        Continue as Client
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Agent Card */}
                        <div className="group">
                            <div
                                onClick={() => handleUserTypeSelect('agent')}
                                className="bg-card border-2 border-border hover:border-primary hover:shadow-xl rounded-2xl p-8 cursor-pointer transition-all duration-300 h-full flex flex-col"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-16 h-16 bg-linear-to-br from-primary/20 to-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Briefcase className="w-8 h-8" />
                                        </div>
                                        <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-foreground mb-4">
                                        I'm an Agent
                                    </h3>
                                    <p className="text-muted-foreground mb-6 leading-relaxed">
                                        Join our network of professional real estate agents. List properties, connect with buyers, and grow your business.
                                    </p>

                                    <div className="space-y-3">
                                        {agentBenefits.map((benefit, index) => (
                                            <div key={index} className="flex items-center gap-3 text-foreground">
                                                <div className="w-5 h-5 bg-primary/10 text-primary rounded flex items-center justify-center">
                                                    {benefit.icon}
                                                </div>
                                                <span className="text-sm">{benefit.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border">
                                    <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-xl font-semibold transition-all duration-300 group-hover:scale-105">
                                        Continue as Agent
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Registration Form */}
                {step === 2 && (
                    <div id="registration-form" className="max-w-2xl mx-auto">
                        {/* Back Button */}
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Change account type</span>
                        </button>

                        {/* Form Container */}
                        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                            {/* Form Header */}
                            <div className="p-6 border-b border-border bg-linear-to-r from-primary/5 via-transparent to-transparent">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">
                                            Create {userType === 'agent' ? 'Agent' : 'Client'} Account
                                        </h2>
                                        <p className="text-muted-foreground mt-1">
                                            Fill in your details to get started
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                        {userType === 'agent' ? (
                                            <Briefcase className="w-4 h-4" />
                                        ) : (
                                            <UserIcon className="w-4 h-4" />
                                        )}
                                        <span>{userType === 'agent' ? 'Agent Account' : 'Client Account'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Success/Error Messages */}
                            {(error || successMessage) && (
                                <div className="m-6">
                                    {error && (
                                        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl animate-in slide-in-from-top-1 duration-300">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-sm font-bold">!</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">Registration Failed</p>
                                                    <p className="text-sm mt-1 opacity-90">{error}</p>
                                                </div>
                                                <button
                                                    onClick={() => setError('')}
                                                    className="text-destructive/60 hover:text-destructive"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {successMessage && (
                                        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl animate-in slide-in-from-top-1 duration-300">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">Success!</p>
                                                    <p className="text-sm mt-1 opacity-90">{successMessage}</p>
                                                </div>
                                                <button
                                                    onClick={() => setSuccessMessage('')}
                                                    className="text-green-600/60 hover:text-green-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Registration Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

                                    {/* Username Field */}
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                                            Username *
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                required
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Choose a username"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            This will be your unique identifier on the platform
                                        </p>
                                    </div>

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                id="first_name"
                                                name="first_name"
                                                type="text"
                                                required
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="last_name" className="block text-sm font-medium text-foreground mb-2">
                                                Last Name *
                                            </label>
                                            <input
                                                id="last_name"
                                                name="last_name"
                                                type="text"
                                                required
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Last name"
                                            />
                                        </div>
                                    </div>

                                    {/* Email and Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="phone_number" className="block text-sm font-medium text-foreground mb-2">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    id="phone_number"
                                                    name="phone_number"
                                                    type="tel"
                                                    required
                                                    value={formData.phone_number}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="+254 XXX XXX XXX"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                                Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-10 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Create a password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="password2" className="block text-sm font-medium text-foreground mb-2">
                                                Confirm Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    id="password2"
                                                    name="password2"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    required
                                                    value={formData.password2}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-10 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Confirm password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information (Only for Agents) */}
                                {userType === 'agent' && (
                                    <div className="space-y-6 pt-6 border-t border-border">
                                        <h3 className="text-lg font-semibold text-foreground">Professional Information</h3>

                                        {/* License and Agency */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="license_number" className="block text-sm font-medium text-foreground mb-2">
                                                    License Number *
                                                </label>
                                                <input
                                                    id="license_number"
                                                    name="license_number"
                                                    type="text"
                                                    required
                                                    value={formData.license_number}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="e.g., REA/12345"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="agency_name" className="block text-sm font-medium text-foreground mb-2">
                                                    Agency Name
                                                </label>
                                                <input
                                                    id="agency_name"
                                                    name="agency_name"
                                                    type="text"
                                                    value={formData.agency_name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Your agency name"
                                                />
                                            </div>
                                        </div>

                                        {/* Experience and Specialization */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="years_of_experience" className="block text-sm font-medium text-foreground mb-2">
                                                    Years of Experience *
                                                </label>
                                                <select
                                                    id="years_of_experience"
                                                    name="years_of_experience"
                                                    required
                                                    value={formData.years_of_experience}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                >
                                                    <option value="">Select experience</option>
                                                    <option value="0-2">0-2 years</option>
                                                    <option value="3-5">3-5 years</option>
                                                    <option value="6-10">6-10 years</option>
                                                    <option value="10+">10+ years</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="specialization" className="block text-sm font-medium text-foreground mb-2">
                                                    Specialization *
                                                </label>
                                                <select
                                                    id="specialization"
                                                    name="specialization"
                                                    required
                                                    value={formData.specialization}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                >
                                                    <option value="">Select specialization</option>
                                                    <option value="residential">Residential</option>
                                                    <option value="commercial">Commercial</option>
                                                    <option value="industrial">Industrial</option>
                                                    <option value="land">Land</option>
                                                    <option value="mixed">Mixed Use</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                                                Professional Bio
                                            </label>
                                            <textarea
                                                id="bio"
                                                name="bio"
                                                rows={4}
                                                value={formData.bio}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Tell us about your experience and expertise..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Terms and Conditions */}
                                <div className="pt-6 border-t border-border">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative mt-1">
                                            <input
                                                type="checkbox"
                                                name="agreeToTerms"
                                                checked={formData.agreeToTerms}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-5 h-5 border-2 border-input rounded-md peer-checked:border-primary peer-checked:bg-primary transition-colors group-hover:border-primary/50">
                                                {formData.agreeToTerms && (
                                                    <svg className="w-4 h-4 mx-auto mt-0.5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm text-foreground">
                                            I agree to the{' '}
                                            <Link href="/terms" className="text-primary hover:text-primary/80 font-medium">
                                                Terms and Conditions
                                            </Link>{' '}
                                            and{' '}
                                            <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium">
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    </label>
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
                                            <span>Creating account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Create {userType === 'agent' ? 'Agent' : 'Client'} Account</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                {/* Login Link */}
                                <div className="text-center pt-4 border-t border-border">
                                    <p className="text-muted-foreground">
                                        Already have an account?{' '}
                                        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Security Note */}
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Your data is protected with 256-bit SSL encryption</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}