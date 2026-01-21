// realestate_frontend/components/sections/CTASection.tsx
export default function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Section Header */}
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Find Your Dream Property?
                    </h2>
                    <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Connect with our expert agents today and take the first step towards owning your perfect property in Kenya.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <button className="group bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl">
                            <span className="flex items-center gap-3">
                                📞 Schedule a Call
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>

                        <button className="group border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm hover:bg-white/10">
                            <span className="flex items-center gap-3">
                                ✉️ Send Inquiry
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>No Upfront Fees</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Verified Properties</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Legal Assurance</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}