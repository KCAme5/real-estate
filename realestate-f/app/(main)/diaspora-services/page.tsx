'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Globe,
    Shield,
    Home,
    TrendingUp,
    Phone,
    Mail,
    MessageSquare,
    Video,
    Clock,
    CheckCircle,
    Users,
    MapPin,
    Award,
    ArrowRight,
    Building2,
    DollarSign,
    Lock,
    Target,
    Search
} from 'lucide-react';

export default function DiasporaServicesPage() {
    const [activeProcess, setActiveProcess] = useState(0);

    const services = [
        {
            icon: Home,
            title: 'Remote Property Purchase',
            description: 'Complete the buying process from anywhere in the world with our virtual assistance.',
            features: ['Virtual Tours', 'Digital Documentation', 'Remote Closing']
        },
        {
            icon: Building2,
            title: 'Property Management',
            description: 'Professional management of your Kenyan property while you\'re abroad.',
            features: ['Tenant Screening', 'Rent Collection', 'Maintenance Coordination']
        },
        {
            icon: TrendingUp,
            title: 'Investment Consulting',
            description: 'Expert advice on the best real estate investment opportunities in Kenya.',
            features: ['Market Analysis', 'ROI Projections', 'Portfolio Management']
        },
        {
            icon: Shield,
            title: 'Legal & Compliance',
            description: 'Ensure all transactions comply with Kenyan laws and regulations.',
            features: ['Legal Documentation', 'Title Verification', 'Compliance Checks']
        }
    ];

    const processSteps = [
        {
            step: 1,
            title: 'Initial Consultation',
            description: 'We understand your goals, budget, and preferences through virtual meetings.',
            duration: '1-2 days',
            icon: Video
        },
        {
            step: 2,
            title: 'Property Search & Shortlisting',
            description: 'Our agents search and shortlist properties matching your criteria, providing detailed reports.',
            duration: '3-7 days',
            icon: Search
        },
        {
            step: 3,
            title: 'Virtual Viewings & Due Diligence',
            description: 'Conduct virtual tours and perform comprehensive property checks and legal verifications.',
            duration: '5-10 days',
            icon: Shield
        },
        {
            step: 4,
            title: 'Purchase Process',
            description: 'We handle negotiations, documentation, and payment processing on your behalf.',
            duration: '14-30 days',
            icon: DollarSign
        },
        {
            step: 5,
            title: 'Post-Purchase Support',
            description: 'Ongoing property management, maintenance, and investment monitoring services.',
            duration: 'Ongoing',
            icon: Users
        }
    ];

    const successStories = [
        {
            name: 'John & Mary Mwangi',
            location: 'London, UK',
            story: 'Purchased a rental property in Nairobi without visiting Kenya. Now earning consistent rental income.',
            property: '3-Bedroom Apartment, Kilimani'
        },
        {
            name: 'Sarah Omondi',
            location: 'Dubai, UAE',
            story: 'Invested in a development project in Mombasa. Received 25% ROI in the first year.',
            property: 'Beachfront Villa, Mombasa'
        },
        {
            name: 'David Kamau',
            location: 'New York, USA',
            story: 'Built a retirement home in Nakuru through remote coordination with our team.',
            property: 'Family Home, Nakuru'
        }
    ];

    const whyChooseUs = [
        {
            icon: Globe,
            title: 'Global Reach, Local Expertise',
            description: 'We understand both international standards and local Kenyan market dynamics.'
        },
        {
            icon: Clock,
            title: 'Time Zone Flexibility',
            description: 'Available for consultations across all time zones to suit your schedule.'
        },
        {
            icon: Lock,
            title: 'Secure Transactions',
            description: 'End-to-end encrypted communication and secure payment processing.'
        },
        {
            icon: Target,
            title: 'Customized Solutions',
            description: 'Tailored services based on your specific needs and investment goals.'
        }
    ];

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-secondary">
                <div className="absolute inset-0 bg-black/40" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-5xl mx-auto text-center py-16 lg:py-24">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full mb-6">
                            <Globe className="w-4 h-4 text-primary-foreground" />
                            <span className="text-sm font-medium text-primary-foreground">
                                Diaspora Real Estate Services
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                            <span className="text-secondary">Kenyan Diaspora</span>{' '}
                            Real Estate Solutions
                        </h1>
                        <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
                            Invest in your homeland with confidence. We make Kenyan real estate accessible,
                            secure, and profitable for Kenyans living abroad.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/contact"
                                className="px-8 py-3 bg-background text-primary hover:bg-muted font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                Start Your Journey <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-3 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold rounded-xl transition-colors"
                            >
                                Explore Services
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Banner */}
            {/* <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4">
                            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                500+
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Diaspora Clients Served
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                $50M+
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Properties Purchased
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                25+
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Countries Served
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                                98%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Client Satisfaction
                            </div>
                        </div>
                    </div>
                </div>
            </section>*/}

            {/* Why Choose Us */}
            <section className="py-16 bg-muted">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                            Why Choose KenyaPrime for Diaspora Services
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We bridge the distance between you and your Kenyan real estate dreams
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {whyChooseUs.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-primary/5 to-secondary/5 mb-6">
                                        <Icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Services */}
            <section id="services" className="py-16 bg-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                            Our Diaspora Services
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Comprehensive solutions tailored for Kenyans living abroad
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <div key={index} className="bg-linear-to-b from-muted to-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                                                <Icon className="w-7 h-7 text-primary" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground mb-2">
                                                {service.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {service.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {service.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="py-16 bg-linear-to-b from-muted to-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                            Our 5-Step Process
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            A streamlined approach designed for remote property acquisition
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Process Steps */}
                            <div className="flex-1 space-y-6">
                                {processSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setActiveProcess(index)}
                                            className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${activeProcess === index
                                                ? 'bg-card shadow-xl border-2 border-primary'
                                                : 'bg-muted hover:bg-card'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeProcess === index
                                                        ? 'bg-linear-to-br from-primary to-secondary'
                                                        : 'bg-muted'
                                                        }`}>
                                                        <span className={`text-lg font-bold ${activeProcess === index ? 'text-primary-foreground' : 'text-muted-foreground'
                                                            }`}>
                                                            {step.step}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-bold text-foreground">
                                                            {step.title}
                                                        </h3>
                                                        <span className="text-sm text-muted-foreground">
                                                            {step.duration}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Process Visualization */}
                            <div className="lg:w-80 flex-shrink-0">
                                <div className="sticky top-24 bg-card rounded-2xl p-8 shadow-xl">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-primary/5 to-secondary/5 mb-4">
                                            <Clock className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">
                                            {processSteps[activeProcess].title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Estimated: {processSteps[activeProcess].duration}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Progress</span>
                                            <span className="text-sm font-medium text-foreground">
                                                Step {activeProcess + 1} of {processSteps.length}
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-linear-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${((activeProcess + 1) / processSteps.length) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <Link
                                        href="/contact"
                                        className="mt-8 w-full px-6 py-3 bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-center block"
                                    >
                                        Start This Step
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-16 bg-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                            Success Stories
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Hear from Kenyans abroad who trusted us with their real estate dreams
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {successStories.map((story, index) => (
                            <div key={index} className="bg-linear-to-b from-muted to-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                                        <Users className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">
                                            {story.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            {story.location}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-muted-foreground mb-6 italic">
                                    "{story.story}"
                                </p>
                                <div className="pt-4 border-t border-border">
                                    <div className="text-sm text-muted-foreground">Property Acquired</div>
                                    <div className="font-medium text-foreground">{story.property}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-linear-to-r from-primary to-secondary">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                            Ready to Invest in Kenya?
                        </h2>
                        <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                            Join hundreds of successful diaspora investors who trust KenyaPrime Properties
                            with their Kenyan real estate journey.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="px-8 py-3 bg-background text-primary hover:bg-muted font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Phone className="w-5 h-5" />
                                Schedule Free Consultation
                            </Link>
                            <Link
                                href="/properties"
                                className="px-8 py-3 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Browse Investment Properties
                            </Link>
                        </div>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-primary/10 backdrop-blur-sm rounded-2xl">
                                <div className="text-2xl font-bold mb-2 text-primary-foreground">24/7</div>
                                <div className="text-sm text-primary-foreground/90">Support Available</div>
                            </div>
                            <div className="p-6 bg-secondary/10 backdrop-blur-sm rounded-2xl">
                                <div className="text-2xl font-bold mb-2 text-secondary-foreground">Free</div>
                                <div className="text-sm text-secondary-foreground/90">Initial Consultation</div>
                            </div>
                            <div className="p-6 bg-accent/10 backdrop-blur-sm rounded-2xl">
                                <div className="text-2xl font-bold mb-2 text-accent-foreground">Secure</div>
                                <div className="text-sm text-accent-foreground/90">Document Handling</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
