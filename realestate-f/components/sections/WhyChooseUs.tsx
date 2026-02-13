// components/sections/WhyChooseUs.tsx
'use client';

export default function WhyChooseUs() {
    const features = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Diaspora Specialists',
            description: 'We understand the unique needs of Kenyans abroad and facilitate remote property acquisition.'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Verified Properties',
            description: 'All our listings are thoroughly vetted to ensure legitimacy and accurate information.'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: 'Legal Assurance',
            description: 'Partner with trusted legal firms to ensure smooth and secure transactions.'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            title: 'Property Management',
            description: 'Complete management services for diaspora clients with properties in Kenya.'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            title: 'Best Prices',
            description: 'Get the best market rates with our extensive network and negotiation expertise.'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: '24/7 Support',
            description: 'Round-the-clock customer support for all your real estate needs.'
        }
    ];

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-emerald-900/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-emerald-500/20">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Why Choose Us
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        The KenyaPrime Advantage
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Experience the difference with our comprehensive real estate solutions and exceptional service.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group text-center p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:-translate-y-2 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Icon */}
                            <div className="w-24 h-24 bg-slate-800 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md border border-slate-700 group-hover:scale-110 transition-transform duration-300 relative z-10">
                                {feature.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-white mb-4 relative z-10">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed relative z-10">
                                {feature.description}
                            </p>

                            {/* Hover Indicator */}
                            <div className="mt-6 w-16 h-1 bg-emerald-500 rounded-full mx-auto scale-x-50 group-hover:scale-x-100 transition-transform duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { number: '500+', label: 'Happy Clients' },
                        { number: 'KSH 15B+', label: 'Property Value' },
                        { number: '98%', label: 'Success Rate' },
                        { number: '24/7', label: 'Support' }
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                                {stat.number}
                            </div>
                            <div className="text-slate-400 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}