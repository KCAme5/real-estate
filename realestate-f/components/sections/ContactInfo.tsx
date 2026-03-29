export default function ContactInfo() {
    const contactDetails = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: 'Visit Our Office',
            details: [
                'KenyaPrime Properties',
                'ABC Place, 1st Floor',
                'Waiyaki Way, Westlands',
                'Nairobi, Kenya'
            ],
            action: {
                text: 'Get Directions',
                link: 'https://www.openstreetmap.org/?mlat=-1.265636999079991&mlon=36.80601051475391#map=18/-1.265636999079991/36.80601051475391'
            }
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: 'Email Us',
            details: [
                'General Inquiries:',
                'info@kenyaprime.co.ke',
                'Sales Team:',
                'sales@kenyaprime.co.ke',
                'Support:',
                'support@kenyaprime.co.ke'
            ],
            action: {
                text: 'Send Email',
                link: 'mailto:info@kenyaprime.co.ke'
            }
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: 'Call Us',
            details: [
                'Main Office:',
                '+254 20 123 4567',
                'Mobile:',
                '+254 712 345 678',
                'Diaspora Line:',
                '+1 (555) 123-4567'
            ],
            action: {
                text: 'Call Now',
                link: 'tel:+254712345678'
            }
        }
    ];

    return (
        <section className="py-16 sm:py-20 bg-slate-950">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                        Reach Us
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Multiple ways to contact us
                    </h2>
                    <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
                        Visit our office, send an email, or call — we’ll guide you through every step.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {contactDetails.map((contact, index) => (
                        <div
                            key={index}
                            className="bg-slate-900/45 border border-slate-800 rounded-3xl p-8 text-center hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-300 group shadow-xl shadow-black/10"
                        >
                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-200 border border-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-500/15 transition-colors">
                                {contact.icon}
                            </div>
                            <h3 className="text-xl font-black text-white mb-4">
                                {contact.title}
                            </h3>
                            <div className="space-y-2 mb-6">
                                {contact.details.map((detail, idx) => (
                                    <p key={idx} className="text-slate-300">
                                        {detail}
                                    </p>
                                ))}
                            </div>
                            <a
                                href={contact.action.link}
                                target={contact.action.link.startsWith('http') ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-emerald-200 hover:text-emerald-100 font-bold transition-colors"
                            >
                                {contact.action.text}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                    ))}
                </div>

                {/* Map Section */}
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-slate-800 bg-slate-900/45">
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                            <svg className="w-6 h-6 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Our Location
                        </h3>
                        <p className="mt-2 text-sm text-slate-300">ABC Place, Westlands — Nairobi, Kenya</p>
                    </div>
                    <div className="h-[400px]">
                        <iframe
                            src="https://www.openstreetmap.org/export/embed.html?bbox=36.79601051475391%2C-1.270636999079991%2C36.81601051475391%2C-1.260636999079991&layer=mapnik&marker=-1.265636999079991%2C36.80601051475391"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            title="KenyaPrime Properties Location"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
