// components/sections/DiasporaServices.tsx
'use client';

export default function DiasporaServices() {
    const services = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: 'Virtual Property Tours',
            description: 'High-quality video tours and live video calls to view properties remotely from anywhere in the world.',
            features: ['Live Video Calls', '360° Virtual Tours', 'Recorded Walkthroughs']
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: 'Legal & Conveyancing',
            description: 'Partner with trusted legal firms for secure property transactions and title verification.',
            features: ['Title Verification', 'Legal Documentation', 'Secure Transactions']
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            title: 'Property Management',
            description: 'Full-service management including tenant placement, rent collection, and property maintenance.',
            features: ['Tenant Management', 'Rent Collection', 'Maintenance Services']
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: 'Investment Advisory',
            description: 'Expert advice on high-yield property investments in Kenya\'s growing real estate market.',
            features: ['Market Analysis', 'ROI Projections', 'Portfolio Strategy']
        }
    ];

    return (
        <section className="py-24 bg-slate-950">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-emerald-900/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-emerald-500/20">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Tailored Solutions
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Diaspora Services
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Comprehensive real estate solutions designed specifically for Kenyans living abroad.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group relative bg-slate-900 rounded-2xl p-8 shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
                        >
                            {/* Animated Green Frame */}
                            <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/50 rounded-2xl transition-colors duration-500 pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <div className="relative z-10 flex items-start gap-6">
                                {/* Icon */}
                                <div className="shrink-0">
                                    <div className="w-16 h-16 bg-slate-800 text-emerald-400 rounded-xl flex items-center justify-center shadow-md group-hover:bg-emerald-500/20 transition-colors duration-300">
                                        {service.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        {service.title}
                                    </h3>
                                    <p className="text-slate-400 mb-4 leading-relaxed">
                                        {service.description}
                                    </p>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2">
                                        {service.features.map((feature, featureIndex) => (
                                            <span
                                                key={featureIndex}
                                                className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-700"
                                            >
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <button className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                        <span className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                            Learn More About Diaspora Services
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}