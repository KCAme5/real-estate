import React from 'react';

export default function TermsOfService() {
    return (
        <>
            <div className="min-h-screen bg-black text-white py-20 px-6 md:px-12 lg:px-24">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-gold mb-12 text-center">
                        Terms of Service
                    </h1>
                    <div className="prose prose-invert prose-lg max-w-none space-y-10">
                        <p className="text-gray-400">Last Updated: November 21, 2025</p>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using kenyaprimerealtors.co.ke (the "Website") and any services provided by KenyaPrime Realtors Limited ("we," "us," "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">2. Eligibility</h2>
                            <p>
                                You must be at least 18 years old and capable of entering into legally binding contracts to use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">3. User Accounts</h2>
                            <p>You are responsible for:</p>
                            <ul className="list-disc pl-8 space-y-3">
                                <li>Maintaining the confidentiality of your login credentials</li>
                                <li>All activities under your account</li>
                                <li>Providing accurate and complete information</li>
                            </ul>
                            <p className="mt-4">We reserve the right to suspend or terminate accounts for any reason.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">4. Property Listings & Information</h2>
                            <p>
                                All property information is provided "as is." We strive for accuracy but do not guarantee completeness, timeliness, or error-free content. Prices, availability, and features may change without notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">5. Payments & Refunds</h2>
                            <p>
                                Payments are processed via Stripe and PayPal. All fees are non-refundable except as required by law or explicitly stated.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">6. Prohibited Activities</h2>
                            <p>You agree not to:</p>
                            <ul className="list-disc pl-8 space-y-3">
                                <li>Use the Website for illegal purposes</li>
                                <li>Scrape, crawl, or spider the site without permission</li>
                                <li>Interfere with site functionality</li>
                                <li>Impersonate any person or entity</li>
                                <li>Upload viruses or malicious code</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">7. Intellectual Property</h2>
                            <p>
                                All content, trademarks, logos, photos, virtual tours, and designs are owned by KenyaPrime Realtors or licensed to us. You may not use them without written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">8. Limitation of Liability</h2>
                            <p>
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, KENYAPRIME REALTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">9. Disclaimer of Warranties</h2>
                            <p>
                                THE WEBSITE AND SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">10. Governing Law</h2>
                            <p>
                                These Terms shall be governed by the laws of the Republic of Kenya. Any disputes shall be subject to the exclusive jurisdiction of Kenyan courts.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">11. Termination</h2>
                            <p>
                                We may terminate or suspend your access immediately, without prior notice, for any reason, including breach of these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">12. Changes to Terms</h2>
                            <p>
                                We may revise these Terms at any time. Continued use after changes constitutes acceptance.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">13. Contact Information</h2>
                            <p>
                                KenyaPrime Realtors Limited<br />
                                Email: legal@kenyaprimerealtors.co.ke<br />
                                Phone: [+254 your number]
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}