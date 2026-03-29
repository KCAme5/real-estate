import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail, Phone } from 'lucide-react';

export default function ContactHero() {
    return (
        <section className="relative isolate overflow-hidden bg-slate-950 pt-28 sm:pt-32 pb-16 sm:pb-24">
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920"
                    alt="Contact"
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-slate-950" />


            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide mb-6 backdrop-blur-sm">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Support, sales, and viewings
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
                        Contact <span className="text-emerald-300">KenyaPrime</span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-200/90 leading-relaxed">
                        Get expert help buying, selling, or scheduling a viewing. We’ll respond within 24 hours on business days.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                        <a
                            href="tel:+254712345678"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-950 px-6 py-4 font-bold shadow-xl shadow-black/20 hover:bg-slate-100 transition-colors"
                        >
                            <Phone size={18} />
                            Call Us
                        </a>
                        <a
                            href="mailto:info@kenyaprime.co.ke"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/15 text-emerald-200 border border-emerald-500/25 px-6 py-4 font-bold hover:bg-emerald-500/20 transition-colors"
                        >
                            <Mail size={18} />
                            Email Us
                        </a>
                        <Link
                            href="/properties"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900/60 text-white border border-slate-800 px-6 py-4 font-bold hover:bg-slate-900 transition-colors"
                        >
                            Browse Listings
                            <ArrowRight size={18} className="opacity-80" />
                        </Link>
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs sm:text-sm text-slate-300">
                        <span className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Response within 24 hours
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Trusted local expertise
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Diaspora-friendly support
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
