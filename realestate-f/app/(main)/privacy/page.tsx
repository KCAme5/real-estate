import React from 'react';

export default function PrivacyPolicy() {
    return (
        <>
            <div className="min-h-screen bg-black text-white py-20 px-6 md:px-12 lg:px-24">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-gold mb-12 text-center">
                        Privacy Policy
                    </h1>
                    <div className="prose prose-invert prose-lg max-w-none space-y-10">
                        <p className="text-gray-400">Last Updated: November 21, 2025</p>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                1. Introduction
                            </h2>
                            <p>
                                KenyaPrime Realtors Limited ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website kenyaprimerealtors.co.ke (the "Website"), create an account, submit inquiries, make payments, or otherwise interact with our services.
                            </p>
                            <p className="mt-4">
                                This Policy complies with the Kenya Data Protection Act, 2019 (KDPA), the General Data Protection Regulation (GDPR) where applicable, the California Consumer Privacy Act (CCPA/CPRA) as amended, and other applicable privacy laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                2. Data Controller
                            </h2>
                            <p>
                                KenyaPrime Realtors Limited<br />
                                Registered in the Republic of Kenya<br />
                                Email: privacy@kenyaprimerealtors.co.ke<br />
                                Phone: [+254 your number – add later]
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                3. Personal Data We Collect
                            </h2>
                            <p>We may collect the following categories of personal information:</p>
                            <ul className="list-disc pl-8 space-y-3 mt-4">
                                <li>Identity Data: full name, title, date of birth</li>
                                <li>Contact Data: email address, phone number, mailing address</li>
                                <li>Financial Data: payment card details, bank account information (processed via Stripe/PayPal)</li>
                                <li>Transaction Data: details about payments and properties you inquire about</li>
                                <li>Profile Data: username, password, favorite properties, saved searches</li>
                                <li>Technical Data: IP address, browser type, device information, cookies</li>
                                <li>Usage Data: pages visited, time spent, referring URLs</li>
                                <li>Marketing and Communications Data: your preferences for receiving marketing</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                4. How We Collect Your Data
                            </h2>
                            <p>We collect data through:</p>
                            <ul className="list-disc pl-8 space-y-3 mt-4">
                                <li>Direct interactions (account registration, inquiry forms, newsletter sign-up)</li>
                                <li>Automated technologies (cookies, server logs, pixels)</li>
                                <li>Third parties: Google Analytics, Meta Pixel, Hotjar, Mailchimp, HubSpot, Stripe, PayPal, Matterport, etc.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                5. Cookies & Tracking Technologies
                            </h2>
                            <p>We use cookies and similar technologies for:</p>
                            <ul className="list-disc pl-8 space-y-3">
                                <li>Essential functionality (login, saved favorites)</li>
                                <li>Analytics (Google Analytics 4, Hotjar)</li>
                                <li>Advertising (Meta Pixel)</li>
                                <li>Performance and user experience</li>
                            </ul>
                            <p className="mt-4">You can manage cookies via your browser settings or our cookie consent banner.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                6. How We Use Your Personal Data (Legal Bases under KDPA & GDPR)
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-700">
                                    <thead>
                                        <tr className="bg-gray-900">
                                            <th className="text-left p-4">Purpose</th>
                                            <th className="text-left p-4">Legal Basis</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        <tr><td className="p-4">Provide real estate services & account management</td><td className="p-4">Contract fulfillment</td></tr>
                                        <tr><td className="p-4">Process payments & prevent fraud</td><td className="p-4">Contract & Legal obligation</td></tr>
                                        <tr><td className="p-4">Send marketing & newsletters</td><td className="p-4">Consent (or legitimate interest where allowed)</td></tr>
                                        <tr><td className="p-4">Analytics & site improvement</td><td className="p-4">Legitimate interest</td></tr>
                                        <tr><td className="p-4">Comply with legal obligations</td><td className="p-4">Legal obligation</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                7. Data Sharing & Third Parties
                            </h2>
                            <p>We share data only with:</p>
                            <ul className="list-disc pl-8 space-y-3">
                                <li>Service providers (Stripe, PayPal, Mailchimp, HubSpot, Google, Meta, Hotjar)</li>
                                <li>Professional advisors (lawyers, accountants)</li>
                                <li>Law enforcement or regulators when legally required</li>
                            </ul>
                            <p className="mt-4 font-semibold">
                                We do NOT sell or share your personal data for cross-contextual behavioral advertising.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                8. International Data Transfers
                            </h2>
                            <p>
                                Your data may be transferred to and processed in countries outside Kenya (e.g., USA for Stripe, Google, Mailchimp). We ensure appropriate safeguards (such as Standard Contractual Clauses and adequacy decisions) are in place.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                9. Data Retention
                            </h2>
                            <p>We keep personal data only as long as necessary:</p>
                            <ul className="list-disc pl-8 space-y-2">
                                <li>Account data: until you delete your account + 7 years (tax/legal)</li>
                                <li>Transaction data: 7 years</li>
                                <li>Marketing data: until you unsubscribe</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                10. Your Legal Rights (Kenya DPA + GDPR + CCPA)
                            </h2>
                            <p>Depending on your location, you may have the right to:</p>
                            <ul className="list-disc pl-8 space-y-3">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Delete your data ("right to be forgotten")</li>
                                <li>Restrict or object to processing</li>
                                <li>Data portability</li>
                                <li>Withdraw consent</li>
                                <li>Opt-out of sale/sharing (we don’t sell)</li>
                                <li>Non-discrimination for exercising rights</li>
                            </ul>
                            <p className="mt-4">
                                Submit requests to: privacy@kenyaprimerealtors.co.ke<br />
                                We respond within 30 days (or 1 month under GDPR).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                11. Security
                            </h2>
                            <p>
                                We implement industry-standard security measures (SSL encryption, access controls, regular audits). However, no internet transmission is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                12. Children’s Privacy
                            </h2>
                            <p>
                                Our services are not directed to individuals under 18. We do not knowingly collect data from children.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                13. Changes to This Policy
                            </h2>
                            <p>
                                We may update this Policy periodically. The new version will be posted here with an updated "Last Updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-6">
                                14. Contact Us
                            </h2>
                            <p>
                                KenyaPrime Realtors Limited<br />
                                Email: privacy@kenyaprimerealtors.co.ke<br />
                                Data Protection Officer: dpo@kenyaprimerealtors.co.ke
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}