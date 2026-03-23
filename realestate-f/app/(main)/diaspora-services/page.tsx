'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Globe, Video, FileCheck, Home, TrendingUp, Shield,
    Phone, Mail, MessageCircle, ChevronRight, Check,
    MapPin, DollarSign, Users, Award, ArrowRight,
    PlayCircle, Calendar, Star, ChevronDown
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
    { value: '$5.04B', label: 'Diaspora remittances to Kenya in 2025' },
    { value: '4%', label: 'Of Kenya\'s GDP from diaspora inflows' },
    { value: '50%+', label: 'Of remittances from the United States' },
    { value: '12–21', label: 'Working days to transfer title remotely' },
];

const SERVICES = [
    {
        icon: Video,
        title: 'Virtual property tours',
        description: 'Explore properties from anywhere in the world through live HD video calls, immersive 3D walkthroughs, and drone footage of the surrounding area. Our agents guide you room by room, answer questions in real time, and provide honest assessments — no sugarcoating.',
        features: ['Live video call viewings', '3D immersive walkthroughs', 'Drone boundary verification', 'Recorded tours on demand'],
        accent: '#3B82F6',
    },
    {
        icon: FileCheck,
        title: 'Legal & title verification',
        description: 'Every property on KenyaPrime is verified through the official Ardhisasa government portal. Our partner advocates conduct full title searches, confirm there are no encumbrances, and handle the entire conveyancing process — including e-signatures and online stamp duty via iTax.',
        features: ['Ardhisasa title search', 'Power of Attorney drafting', 'e-Conveyancing 2025', 'Stamp duty via iTax'],
        accent: '#10B981',
    },
    {
        icon: Home,
        title: 'Property management',
        description: 'Own your property from abroad without the headache. Our vetted management partners handle tenant screening, rent collection, maintenance, and monthly reporting. You receive your rental income via M-Pesa or direct bank transfer — wherever you are in the world.',
        features: ['Tenant screening & placement', 'Rent collection & transfer', 'Maintenance coordination', 'Monthly financial reports'],
        accent: '#F59E0B',
    },
    {
        icon: TrendingUp,
        title: 'Investment advisory',
        description: 'Not sure where to invest? Our advisors analyse ROI potential, rental yield estimates, and neighbourhood growth trajectories for every listing. We cover Nairobi\'s prime corridors — Westlands, Karen, Kilimani — as well as emerging towns with outsized upside.',
        features: ['ROI & yield projections', 'Neighbourhood growth analysis', 'Emerging towns guide', 'Portfolio strategy sessions'],
        accent: '#8B5CF6',
    },
    {
        icon: DollarSign,
        title: 'Diaspora financing',
        description: 'Access mortgage options from KCB Diaspora Banking, Equity Bank, and NCBA specifically designed for Kenyans abroad. We also accept SWIFT transfers, M-Pesa international, and can structure phased payment plans tied to construction milestones for off-plan purchases.',
        features: ['KCB & Equity diaspora mortgages', 'SWIFT & M-Pesa accepted', 'Off-plan payment plans', 'Forex guidance'],
        accent: '#EF4444',
    },
    {
        icon: Shield,
        title: 'Fraud protection',
        description: 'Land scams are the number one fear of diaspora buyers. Every listing is verified by our team before it goes live. We only work with EARB-registered agents, conduct Ardhisasa searches before any transaction, and hold funds in escrow until title transfer is confirmed.',
        features: ['EARB-registered agents only', 'Ardhisasa verification on all listings', 'Escrow payment protection', 'No upfront agent fees'],
        accent: '#06B6D4',
    },
];

const PROCESS_STEPS = [
    {
        number: '01',
        title: 'Book a free consultation',
        description: 'Schedule a video call with a KenyaPrime diaspora specialist. We\'ll discuss your goals, budget, preferred locations, and timeline — no obligation.',
    },
    {
        number: '02',
        title: 'Receive curated listings',
        description: 'Within 48 hours we send you a personalised selection of verified properties matching your criteria, complete with photos, videos, and neighbourhood reports.',
    },
    {
        number: '03',
        title: 'Virtual viewing',
        description: 'Tour your shortlisted properties via live video call with our on-the-ground agents. Ask any questions, request additional footage, or arrange a trusted representative to visit in person.',
    },
    {
        number: '04',
        title: 'Legal & due diligence',
        description: 'Our partner advocates run a full title search on Ardhisasa, draft your Power of Attorney if needed, and prepare all sale documentation. Everything is handled digitally.',
    },
    {
        number: '05',
        title: 'Secure payment',
        description: 'Transfer funds via SWIFT to your advocate\'s escrow account. For off-plan purchases, payments are tied to verified construction milestones for complete transparency.',
    },
    {
        number: '06',
        title: 'Title transfer & handover',
        description: 'Your advocate uploads all documents to Ardhisasa. Title is registered in your name within 12–21 working days. We can connect you with our property management team for immediate rental setup.',
    },
];

const FAQS = [
    {
        q: 'Can I buy property in Kenya without visiting in person?',
        a: 'Yes. Through a restricted Power of Attorney granted to a licensed Kenyan advocate, the entire purchase — from offer to title transfer — can be completed remotely in 2025. Our team coordinates every step.',
    },
    {
        q: 'Can Kenyan citizens in the diaspora own freehold land?',
        a: 'Yes. Kenyan citizens, including dual citizens, can own any type of land including freehold. Foreign nationals are restricted to leasehold for up to 99 years.',
    },
    {
        q: 'How do I verify a property is legitimate from abroad?',
        a: 'All KenyaPrime listings are verified through the official Ardhisasa government portal before going live. We provide the title search results to you directly. We also only work with EARB-registered agents.',
    },
    {
        q: 'What payment methods do you accept from abroad?',
        a: 'We accept SWIFT international bank transfers, M-Pesa international, and direct bank transfers. All funds are held in your advocate\'s escrow account and only released upon meeting agreed conditions.',
    },
    {
        q: 'How long does the entire process take?',
        a: 'From first consultation to title transfer typically takes 6–12 weeks depending on property type and financing. e-Conveyancing in 2025 has significantly reduced timelines — title is usually issued within 12–21 working days of completion.',
    },
    {
        q: 'What are the taxes and fees involved?',
        a: 'Stamp duty is 2% for land and 4% for buildings, paid via iTax. Legal fees typically range from Ksh 50,000 to Ksh 200,000 depending on property value. There are no upfront agent fees on KenyaPrime.',
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

// ─── Components ───────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="border-b border-white/10 last:border-none"
            onClick={() => setOpen(v => !v)}
        >
            <button className="w-full flex items-center justify-between py-5 text-left gap-4">
                <span className="text-sm font-semibold text-white">{q}</span>
                <ChevronDown
                    size={16}
                    className="flex-shrink-0 text-slate-400 transition-transform duration-200"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </button>
            {open && (
                <p className="pb-5 text-sm text-slate-400 leading-relaxed">{a}</p>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiasporaServicesPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white">

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative min-h-[92vh] flex items-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2075&q=80"
                        alt="Luxury Kenyan property"
                        className="w-full h-full object-cover"
                    />
                    {/* Dark overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-[#020617]/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
                    <div className="max-w-2xl space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest">
                            <Globe size={12} />
                            Serving Kenyans in 50+ countries
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight">
                            Own a piece of{' '}
                            <span className="text-transparent bg-clip-text"
                                style={{ backgroundImage: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                                home
                            </span>
                            {' '}from anywhere
                        </h1>

                        <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                            KenyaPrime connects the Kenyan diaspora with verified properties, trusted legal support, and end-to-end remote buying — from first viewing to title transfer, without setting foot in Kenya.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/contact"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm text-white transition-all active:scale-95 shadow-xl"
                                style={{
                                    background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                                    boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
                                }}
                            >
                                Book a free consultation
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/properties"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
                            >
                                <PlayCircle size={16} />
                                Browse listings
                            </Link>
                        </div>

                        {/* Trust signals */}
                        <div className="flex flex-wrap items-center gap-6 pt-4">
                            {['EARB Registered Agents', 'Ardhisasa Verified', 'No Upfront Fees'].map(t => (
                                <div key={t} className="flex items-center gap-2 text-xs text-slate-400">
                                    <Check size={12} className="text-emerald-400" />
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <ChevronDown size={20} className="text-slate-500" />
                </div>
            </section>

            {/* ── Stats bar ────────────────────────────────────────────────── */}
            <section className="border-y border-white/10 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((s, i) => (
                        <div key={i} className="text-center space-y-1">
                            <p className="text-3xl font-black text-white">{s.value}</p>
                            <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Why Kenya ─────────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-16">
                <div className="max-w-2xl space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-400">Why invest now</p>
                    <h2 className="text-4xl font-black leading-tight">Kenya's property market is outperforming</h2>
                    <p className="text-slate-400 leading-relaxed">
                        Nairobi offers rental yields of 5–11% — significantly higher than London, New York, or Dubai for comparable investment sizes. With diaspora remittances hitting a record <span className="text-white font-semibold">$5.04 billion in 2025</span>, and the government's Kenya Diaspora Investment Strategy 2025–2030 actively courting overseas investors, there has never been a better time to buy.
                    </p>
                </div>

                {/* Location yield cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {LOCATIONS.map((loc, i) => (
                        <div
                            key={i}
                            className="group p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <MapPin size={16} className="text-blue-400 mt-0.5" />
                                <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                                    {loc.yield} yield
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-white mb-1">{loc.name}</h3>
                            <p className="text-xs text-slate-500">{loc.type}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Services ──────────────────────────────────────────────────── */}
            <section className="border-t border-white/10 bg-white/[0.015]">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-16">
                    <div className="max-w-2xl space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-blue-400">Our services</p>
                        <h2 className="text-4xl font-black leading-tight">Everything you need, handled remotely</h2>
                        <p className="text-slate-400 leading-relaxed">
                            We've built a complete end-to-end service for diaspora buyers — from first viewing to post-purchase management — so you never have to navigate the Kenyan property market alone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {SERVICES.map((svc, i) => (
                            <div
                                key={i}
                                className="group p-7 rounded-2xl border border-white/10 bg-[#0D1117] hover:border-white/20 transition-all space-y-5"
                            >
                                {/* Icon */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: `${svc.accent}18` }}
                                >
                                    <svc.icon size={22} style={{ color: svc.accent }} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-base font-black text-white">{svc.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{svc.description}</p>
                                </div>

                                <ul className="space-y-2">
                                    {svc.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-xs text-slate-400">
                                            <Check size={11} style={{ color: svc.accent, flexShrink: 0 }} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Process ───────────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-16">
                <div className="max-w-2xl space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-400">How it works</p>
                    <h2 className="text-4xl font-black leading-tight">From consultation to keys — 6 steps</h2>
                    <p className="text-slate-400 leading-relaxed">
                        Our streamlined process has helped diaspora buyers close completely remotely. Every step is handled by our team so you can invest with confidence from wherever you are.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PROCESS_STEPS.map((step, i) => (
                        <div key={i} className="relative p-7 rounded-2xl border border-white/10 bg-[#0D1117] space-y-4">
                            {/* Step number */}
                            <span
                                className="text-5xl font-black leading-none"
                                style={{ color: 'rgba(59,130,246,0.15)' }}
                            >
                                {step.number}
                            </span>
                            <div className="space-y-2">
                                <h3 className="text-base font-black text-white">{step.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                            </div>
                            {/* Connector arrow — not on last items */}
                            {i < PROCESS_STEPS.length - 1 && (
                                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                                    <ChevronRight size={16} className="text-slate-700" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Fraud protection callout ──────────────────────────────────── */}
            <section className="border-y border-white/10 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <Shield size={28} className="text-emerald-400" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <h3 className="text-xl font-black text-white">Protecting diaspora buyers from land fraud</h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                                Land scams cost Kenyan diaspora buyers hundreds of millions annually. Every property listed on KenyaPrime is verified through the official <span className="text-white font-semibold">Ardhisasa government portal</span> before it goes live. We only work with agents registered with the <span className="text-white font-semibold">Estate Agents Registration Board (EARB)</span>. Payments are held in a licensed advocate's escrow account and only released upon verified title transfer. No upfront agent fees, ever.
                            </p>
                        </div>
                        <Link
                            href="/contact"
                            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/40 text-emerald-400 text-sm font-bold hover:bg-emerald-500/10 transition-all"
                        >
                            Learn more <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────────────────────────── */}
            <section className="max-w-4xl mx-auto px-6 md:px-12 py-24 space-y-12">
                <div className="text-center space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-400">Questions & answers</p>
                    <h2 className="text-4xl font-black">Frequently asked questions</h2>
                    <p className="text-slate-400">Everything diaspora buyers ask us before getting started.</p>
                </div>

                <div className="bg-[#0D1117] border border-white/10 rounded-2xl px-8 divide-y divide-white/10">
                    {FAQS.map((faq, i) => (
                        <FaqItem key={i} q={faq.q} a={faq.a} />
                    ))}
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
                <div
                    className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center space-y-8"
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
                        border: '1px solid rgba(59,130,246,0.2)',
                    }}
                >
                    {/* Background glow */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-20 blur-3xl"
                        style={{ background: '#3B82F6' }}
                    />

                    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest">
                            <Calendar size={12} />
                            Free 30-minute video consultation
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black leading-tight">
                            Ready to invest in Kenya?
                        </h2>

                        <p className="text-slate-400 leading-relaxed">
                            Book a free 30-minute video call with a KenyaPrime diaspora specialist. We'll understand your goals and send you a personalised property shortlist within 48 hours — no obligation, no pressure.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/contact"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm text-white transition-all active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                                    boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
                                }}
                            >
                                <Calendar size={16} />
                                Book free consultation
                            </Link>
                            <Link
                                href="/properties"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-slate-300 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
                            >
                                Browse verified listings
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        {/* Contact options */}
                        <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
                            {[
                                { icon: Phone, label: '+254 700 000 000' },
                                { icon: Mail, label: 'diaspora@kenyaprime.com' },
                                { icon: MessageCircle, label: 'WhatsApp us' },
                            ].map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                                    <c.icon size={13} className="text-slate-400" />
                                    {c.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}