'use client';

import { useState } from 'react';

const faqItems = [
    {
        question: 'What are your business hours?',
        answer: 'Our main office is open Monday to Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 2:00 PM. We are closed on Sundays and public holidays.'
    },
    {
        question: 'How quickly can I expect a response?',
        answer: 'We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call our emergency line at +254 712 345 678.'
    },
    {
        question: 'Do you serve clients outside Kenya?',
        answer: 'Absolutely! We specialize in serving the Kenyan diaspora. We offer virtual tours, remote property management, and international payment options to make the process seamless for clients abroad.'
    },
    {
        question: 'What information should I provide when contacting about a property?',
        answer: 'Please provide the property reference number if available, your preferred contact method, whether you\'re interested in buying or renting, your budget range, and any specific requirements you have.'
    },
    {
        question: 'Can I schedule a physical property viewing?',
        answer: 'Yes, we can schedule property viewings at your convenience. Please contact us with your preferred dates and times, and we\'ll arrange viewings for properties that match your criteria.'
    },
    {
        question: 'Do you provide legal assistance for property transactions?',
        answer: 'We partner with trusted legal firms to provide comprehensive conveyancing services. We can connect you with our legal partners for title verification, contract preparation, and transaction processing.'
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept bank transfers, mobile money (M-Pesa), and credit/debit cards. For diaspora clients, we also accept international wire transfers and other secure payment methods.'
    },
    {
        question: 'Is there a fee for your consultation services?',
        answer: 'Initial consultations are free. We only charge fees for specific services like property management, legal assistance, or when transactions are completed. All fees are transparent and discussed upfront.'
    }
];

export default function ContactFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 sm:py-20 bg-slate-950">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                        FAQ
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Common questions
                    </h2>
                    <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
                        Quick answers about viewings, timelines, diaspora support, and payments.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                        {faqItems.map((item, index) => (
                            <div
                                key={index}
                                className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/35"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-900/55 transition-colors"
                                >
                                    <span className="text-base sm:text-lg font-bold text-white pr-6">
                                        {item.question}
                                    </span>
                                    <svg
                                        className={`w-5 h-5 text-slate-300 transition-transform shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div
                                    className={`px-6 overflow-hidden transition-all duration-300 ${openIndex === index ? 'py-4 border-t border-slate-800' : 'max-h-0 py-0'}`}
                                >
                                    <p className="text-slate-300 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Still Have Questions? */}
                    <div className="mt-12 text-center">
                        <div className="bg-gradient-to-r from-emerald-500/10 via-slate-900/30 to-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8">
                            <h3 className="text-2xl font-black text-white mb-4">
                                Still have questions?
                            </h3>
                            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                                Can't find the answer you're looking for? Our team is here to help.
                            </p>
                            <a
                                href="tel:+254712345678"
                                className="inline-flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-950 px-8 py-4 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 shadow-xl shadow-black/20"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Call Us Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
