'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Building2,
    Shield,
    Target,
    Users,
    Award,
    MapPin,
    Home,
    TrendingUp,
    Heart,
    CheckCircle,
    ArrowRight,
    Phone,
} from 'lucide-react';

export default function AboutPage() {
    const [activeTab, setActiveTab] = useState('mission');

    const values = [
        {
            icon: Shield,
            title: 'Trust & Integrity',
            description: 'We believe in building relationships based on trust, transparency, and ethical practices.',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30'
        },
        {
            icon: Target,
            title: 'Excellence',
            description: 'Striving for excellence in every transaction, ensuring exceptional service and results.',
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30'
        },
        {
            icon: Users,
            title: 'Client-Centric',
            description: 'Your goals are our priority. We listen, understand, and deliver personalized solutions.',
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30'
        },
        {
            icon: MapPin,
            title: 'Local Expertise',
            description: 'Deep knowledge of local markets, trends, and opportunities across Kenya.',
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30'
        },
    ];

    const services = [
        'Property Buying & Selling',
        'Rental Management',
        'Property Valuation',
        'Real Estate Investment',
        'Market Analysis',
        'Legal Assistance',
        'Property Inspection',
        'Mortgage Assistance'
    ];

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-secondary">
                <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-4xl mx-auto text-center py-16 lg:py-24">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full mb-6">
                            <Building2 className="w-4 h-4 text-primary-foreground" />
                            <span className="text-sm font-medium text-primary-foreground">
                                About KenyaPrime Properties
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                            Building Dreams,{' '}
                            <span className="text-secondary">Creating Homes</span>
                        </h1>
                        <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
                            For over a decade, we've been helping individuals and families find their perfect spaces,
                            transforming properties into homes and investments into legacies.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/contact"
                                className="px-8 py-3 bg-background text-primary hover:bg-muted font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                Contact Us <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/properties"
                                className="px-8 py-3 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold rounded-xl transition-colors"
                            >
                                Browse Properties
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story & Mission Section */}
            <section className="py-16 bg-muted">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap border-b border-border mb-8">
                            {['mission', 'vision', 'story'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 font-medium text-sm uppercase tracking-wider transition-colors ${activeTab === tab
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {tab === 'mission' && 'Our Mission'}
                                    {tab === 'vision' && 'Our Vision'}
                                    {tab === 'story' && 'Our Story'}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-8">
                            {activeTab === 'mission' && (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <Target className="w-12 h-12 text-primary flex-shrink-0" />
                                        <div>
                                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                                Our Mission
                                            </h3>
                                            <p className="text-lg text-muted-foreground">
                                                To simplify the real estate journey for every Kenyan, providing expert guidance,
                                                transparent processes, and personalized solutions that transform property dreams into reality.
                                            </p>
                                            <div className="mt-6 space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                                    <span className="text-muted-foreground">
                                                        Empower clients with knowledge and tools for informed decisions
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                                    <span className="text-muted-foreground">
                                                        Maintain the highest standards of integrity and professionalism
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                                    <span className="text-muted-foreground">
                                                        Build lasting relationships based on trust and results
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'vision' && (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <TrendingUp className="w-12 h-12 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                                Our Vision
                                            </h3>
                                            <p className="text-lg text-muted-foreground">
                                                To be Kenya's most trusted real estate partner, recognized for innovation,
                                                excellence, and commitment to shaping vibrant communities through intelligent property solutions.
                                            </p>
                                            <div className="mt-6 p-6 bg-linear-to-r from-primary/5 to-secondary/5 rounded-2xl border border-border">
                                                <h4 className="font-bold text-foreground mb-3">
                                                    Future Goals
                                                </h4>
                                                <ul className="space-y-3">
                                                    <li className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                        <span className="text-muted-foreground">
                                                            Expand to 10+ counties across Kenya
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
                                                        <span className="text-muted-foreground">
                                                            Launch digital property management platform
                                                        </span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                                                        <span className="text-muted-foreground">
                                                            Support 1000+ families achieve home ownership
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'story' && (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <Building2 className="w-12 h-12 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                                Our Story
                                            </h3>
                                            <p className="text-lg text-muted-foreground mb-6">
                                                Founded in 2010, KenyaPrime Properties began as a small office with a big dream:
                                                to make real estate accessible, transparent, and rewarding for everyone.
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div>
                                                    <h4 className="font-bold text-foreground mb-3">
                                                        Humble Beginnings
                                                    </h4>
                                                    <p className="text-muted-foreground">
                                                        Starting with just three agents, we focused on building trust one client at a time.
                                                        Our commitment to honesty and results quickly earned us a reputation for excellence.
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground mb-3">
                                                        Growth & Innovation
                                                    </h4>
                                                    <p className="text-muted-foreground">
                                                        As we grew, we embraced technology while staying true to our core values.
                                                        Today, we combine local expertise with digital innovation to serve clients better.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {/* Values Section */}
            <section className="py-16 bg-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            These principles guide every decision we make and every relationship we build
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={index}
                                    className={`p-6 rounded-2xl ${value.bgColor} transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
                                >
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-card mb-6 border border-border">
                                        <Icon className={`w-7 h-7 ${value.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">
                                        {value.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-16 bg-muted">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                                Comprehensive Real Estate Services
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                From finding your dream home to managing your investments, we provide end-to-end
                                solutions tailored to your needs.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {services.map((service, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                                        <span className="text-muted-foreground">{service}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-linear-to-br from-primary to-secondary rounded-2xl p-8 lg:p-12 text-primary-foreground shadow-xl">
                                <h3 className="text-2xl font-bold mb-4">Ready to Begin Your Journey?</h3>
                                <p className="text-primary-foreground/90 mb-6">
                                    Whether you're buying, selling, or investing, our team is here to guide you every step of the way.
                                </p>
                                <div className="space-y-4">
                                    <Link
                                        href="/contact"
                                        className="block w-full px-6 py-3 bg-background text-primary hover:bg-muted font-medium rounded-xl transition-colors text-center border border-transparent hover:border-border"
                                    >
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Schedule Consultation
                                    </Link>
                                    <Link
                                        href="/properties"
                                        className="block w-full px-6 py-3 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-medium rounded-xl transition-colors text-center"
                                    >
                                        <Home className="w-4 h-4 inline mr-2" />
                                        View Properties
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}