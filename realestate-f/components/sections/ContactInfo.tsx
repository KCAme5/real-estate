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
                link: 'https://maps.google.com/?q=ABC+Place,+Waiyaki+Way,+Nairobi'
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
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Get in Touch
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Multiple ways to reach us. Choose what works best for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {contactDetails.map((contact, index) => (
                        <div
                            key={index}
                            className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:border-primary/30 group"
                        >
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                {contact.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                {contact.title}
                            </h3>
                            <div className="space-y-2 mb-6">
                                {contact.details.map((detail, idx) => (
                                    <p key={idx} className="text-muted-foreground">
                                        {detail}
                                    </p>
                                ))}
                            </div>
                            <a
                                href={contact.action.link}
                                target={contact.action.link.startsWith('http') ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
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
                <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
                    <div className="bg-card p-6 border-b border-border">
                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Our Location
                        </h3>
                    </div>
                    <div className="h-[400px]">
                        {/* Google Maps Embed */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.847208379022!2d36.80601051475391!3d-1.265636999079991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c0a1f9d27%3A0x44301a10c095dc8c!2sABC%20Place!5e0!3m2!1sen!2ske!4v1641381773244!5m2!1sen!2ske"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="KenyaPrime Properties Location"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}