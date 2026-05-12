'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Globe, Video, FileCheck, Home, TrendingUp, Shield,
    Check, MapPin, DollarSign, ArrowRight, PlayCircle,
    ChevronDown, Phone, Mail, Calendar
} from 'lucide-react';

const STATS = [
    { value: '4%', label: "Of Kenya's GDP from diaspora inflows" },
    { value: '50%+', label: 'Of remittances from the United States' },
    { value: '12–21', label: 'Working days to transfer title remotely' },
];

const SERVICES = [
    {
        icon: Video,
        title: 'Virtual property tours',
        description: 'Explore properties from anywhere through live HD video calls, 3D walkthroughs, and drone footage.',
        features: ['Live video call viewings', '3D immersive walkthroughs', 'Drone boundary verification'],
    },
    {
        icon: FileCheck,
        title: 'Legal & title verification',
        description: 'Every property verified through Ardhisasa. Our advocates conduct full title searches and handle conveyancing.',
        features: ['Ardhisasa title search', 'Power of Attorney drafting', 'e-Conveyancing 2025'],
    },
    {
        icon: Home,
        title: 'Property management',
        description: 'Own your property from abroad without the headache. We handle tenants, rent collection, and maintenance.',
        features: ['Tenant screening', 'Rent collection', 'Maintenance coordination'],
    },
    {
        icon: TrendingUp,
        title: 'Investment advisory',
        description: 'Our advisors analyse ROI potential, rental yields, and neighbourhood growth trajectories.',
        features: ['ROI projections', 'Growth analysis', 'Portfolio strategy'],
    },
    {
        icon: DollarSign,
        title: 'Diaspora financing',
        description: 'Access mortgage options from KCB, Equity Bank, and NCBA designed for Kenyans abroad.',
        features: ['Diaspora mortgages', 'SWIFT transfers', 'Payment plans'],
    },
    {
        icon: Shield,
        title: 'Fraud protection',
        description: 'Every listing verified before going live. We work with EARB-registered agents only.',
        features: ['EARB-registered agents', 'Ardhisasa verification', 'Escrow protection'],
    },
];

const LOCATIONS = [
    { name: 'Westlands', type: 'Prime residential & commercial', yield: '6–8%' },
    { name: 'Karen', type: 'Luxury residential', yield: '5–7%' },
    { name: 'Kilimani', type: 'High-density residential', yield: '7–9%' },
    { name: 'Kileleshwa', type: 'Upmarket apartments', yield: '6–8%' },
    { name: 'Ruaka', type: 'Emerging — high growth', yield: '8–11%' },
    { name: 'Mombasa', type: 'Coastal lifestyle & holiday', yield: '7–10%' },
];

const FAQS = [
    {
        q: 'Can I buy property in Kenya without visiting in person?',
        a: 'Yes. Through a restricted Power of Attorney granted to a licensed Kenyan advocate, the entire purchase can be completed remotely in 2025.',
    },
    {
        q: 'Can Kenyan citizens in the diaspora own freehold land?',
        a: 'Yes. Kenyan citizens, including dual citizens, can own any type of land including freehold. Foreign nationals are restricted to leasehold for up to 99 years.',
    },
    {
        q: 'How do I verify a property is legitimate from abroad?',
        a: 'All Tugai Realtors listings are verified through Ardhisasa before going live. We provide title search results directly to you.',
    },
    {
        q: 'What payment methods do you accept from abroad?',
        a: 'We accept SWIFT international bank transfers, M-Pesa international, and direct bank transfers held in escrow.',
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-border last:border-none">
            <button
                className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-primary transition-colors"
                onClick={() => setOpen(v => !v)}
            >
                <span className="text-sm font-semibold">{q}</span>
                <ChevronDown
                    size={16}
                    className="flex-shrink-0 text-muted-foreground transition-transform duration-200"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </button>
            {open && (
                <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
            )}
        </div>
    );
}

export default function DiasporaServicesPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2075&q=80"
                        alt="Luxury Kenyan property"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
                    <div className="max-w-3xl space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                            <Globe size={14} />
                            Serving Kenyans in 50+ countries
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                            Own a piece of{' '}
                            <span className="text-primary">home</span>
                            {' '}from anywhere
                        </h1>

                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Tugai Realtors connects the Kenyan diaspora with verified properties, trusted legal support, and end-to-end remote buying — from first viewing to title transfer.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm text-white bg-primary hover:bg-primary/90 transition-all active:scale-95"
                            >
                                Book a free consultation
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/properties"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm border border-border hover:bg-accent transition-all"
                            >
                                <PlayCircle size={16} />
                                Browse listings
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-4">
                            {['EARB Registered Agents', 'Ardhisasa Verified', 'No Upfront Fees'].map(t => (
                                <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Check size={12} className="text-primary" />
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="border-y border-border bg-accent/30">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-2 md:grid-cols-3 gap-8">
                    {STATS.map((s, i) => (
                        <div key={i} className="text-center space-y-2">
                            <p className="text-3xl font-bold text-foreground">{s.value}</p>
                            <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Kenya Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-16">
                <div className="max-w-2xl space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Why invest now</p>
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">Kenya's property market is outperforming</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Nairobi offers rental yields of 5–11% — significantly higher than London, New York, or Dubai. With diaspora remittances hitting record highs, there has never been a better time to buy.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {LOCATIONS.map((loc, i) => (
                        <div
                            key={i}
                            className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <MapPin size={16} className="text-primary mt-0.5" />
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                    {loc.yield} yield
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{loc.name}</h3>
                            <p className="text-xs text-muted-foreground">{loc.type}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services Section */}
            <section className="border-t border-border bg-accent/30">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-16">
                    <div className="max-w-2xl space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Our services</p>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">Everything you need, handled remotely</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Complete end-to-end service for diaspora buyers — from first viewing to post-purchase management.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {SERVICES.map((svc, i) => (
                            <div
                                key={i}
                                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all space-y-4"
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <svc.icon size={24} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-bold">{svc.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{svc.description}</p>
                                <ul className="space-y-2">
                                    {svc.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Check size={12} className="text-primary flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-16">
                <div className="max-w-2xl space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">How it works</p>
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">Buy from anywhere in 6 steps</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { num: '01', title: 'Book consultation', desc: 'Schedule a video call with our diaspora specialist' },
                        { num: '02', title: 'Receive listings', desc: 'Get curated properties matching your criteria within 48 hours' },
                        { num: '03', title: 'Virtual viewing', desc: 'Tour properties via live video with our agents' },
                        { num: '04', title: 'Legal diligence', desc: 'Full title search and documentation handled digitally' },
                        { num: '05', title: 'Secure payment', desc: 'Transfer funds via SWIFT to escrow account' },
                        { num: '06', title: 'Title transfer', desc: 'Title registered in your name within 12–21 days' },
                    ].map((step, i) => (
                        <div key={i} className="relative p-6 rounded-xl border border-border bg-card space-y-4">
                            <span className="text-4xl font-bold text-primary/20">{step.num}</span>
                            <h3 className="text-lg font-bold">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="border-t border-border bg-accent/30">
                <div className="max-w-3xl mx-auto px-6 md:px-12 py-20 space-y-12">
                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">FAQ</p>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">Common questions</h2>
                    </div>

                    <div className="space-y-2">
                        {FAQS.map((faq, i) => (
                            <FaqItem key={i} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                <div className="relative p-8 md:p-12 rounded-2xl bg-primary overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10 max-w-2xl space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to own your piece of Kenya?</h2>
                        <p className="text-white/80 leading-relaxed">
                            Schedule a free consultation with our diaspora specialists today. No obligation, just expert guidance.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm bg-white text-primary hover:bg-white/90 transition-all"
                            >
                                <Calendar size={16} />
                                Book consultation
                            </Link>
                            <Link
                                href="tel:+254700000000"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-all"
                            >
                                <Phone size={16} />
                                Call us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
