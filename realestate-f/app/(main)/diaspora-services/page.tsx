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
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-900">
                <div className="absolute inset-0 bg-black/40" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-5xl mx-auto text-center py-16 lg:py-24">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                            <Globe className="w-4 h-4 text-white" />
                            <span className="text-sm font-medium text-white">
                                Diaspora Real Estate Services
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            <span className="text-emerald-300">Kenyan Diaspora</span>{' '}
                            Real Estate Solutions
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                            Invest in your homeland with confidence. We make Kenyan real estate accessible,
                            secure, and profitable for Kenyans living abroad.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/contact"
                                className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                Start Your Journey <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-3 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-xl transition-colors"
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
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Why Choose KenyaPrime for Diaspora Services
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            We bridge the distance between you and your Kenyan real estate dreams
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {whyChooseUs.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 mb-6">
                                        <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Services */}
            <section id="services" className="py-16 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Diaspora Services
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Comprehensive solutions tailored for Kenyans living abroad
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <div key={index} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                                                <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                {service.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {service.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {service.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
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
            <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Our 5-Step Process
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
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
                                                ? 'bg-white dark:bg-gray-800 shadow-xl border-2 border-blue-500'
                                                : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeProcess === index
                                                        ? 'bg-gradient-to-br from-blue-500 to-emerald-500'
                                                        : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'
                                                        }`}>
                                                        <span className={`text-lg font-bold ${activeProcess === index ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {step.step}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {step.title}
                                                        </h3>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {step.duration}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400">
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
                                <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 mb-4">
                                            <Clock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {processSteps[activeProcess].title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Estimated: {processSteps[activeProcess].duration}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Step {activeProcess + 1} of {processSteps.length}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${((activeProcess + 1) / processSteps.length) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <Link
                                        href="/contact"
                                        className="mt-8 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-center block"
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
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Success Stories
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Hear from Kenyans abroad who trusted us with their real estate dreams
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {successStories.map((story, index) => (
                            <div key={index} className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                                        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {story.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            {story.location}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                                    "{story.story}"
                                </p>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Property Acquired</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{story.property}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-900 to-emerald-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                            Ready to Invest in Kenya?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join hundreds of successful diaspora investors who trust KenyaPrime Properties
                            with their Kenyan real estate journey.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="px-8 py-3 bg-white text-blue-900 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Phone className="w-5 h-5" />
                                Schedule Free Consultation
                            </Link>
                            <Link
                                href="/properties"
                                className="px-8 py-3 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Browse Investment Properties
                            </Link>
                        </div>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                                <div className="text-2xl font-bold mb-2">24/7</div>
                                <div className="text-sm text-blue-100">Support Available</div>
                            </div>
                            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                                <div className="text-2xl font-bold mb-2">Free</div>
                                <div className="text-sm text-blue-100">Initial Consultation</div>
                            </div>
                            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                                <div className="text-2xl font-bold mb-2">Secure</div>
                                <div className="text-sm text-blue-100">Document Handling</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
