"use client";
import React from 'react';

const steps = [
    {
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        title: 'Browse',
        description: 'Explore thousands of verified listings across Kenya with detailed filters.'
    },
    {
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
        ),
        title: 'Connect',
        description: 'Chat directly with local real estate experts who know the neighborhoods.'
    },
    {
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        title: 'View & Book',
        description: 'Schedule a physical or virtual tour at your convenience.'
    },
    {
        icon: (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
        title: 'Move In',
        description: 'Finalize the paperwork with our secure platform and enjoy your new home.'
    }
];

const HowItWorks: React.FC = () => {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">How It Works</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Your journey to a new home simplified in four easy steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative flex flex-col items-center text-center group">
                            {idx < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-slate-800 -translate-x-12 z-0"></div>
                            )}
                            <div className="relative z-10 w-24 h-24 bg-slate-900 rounded-3xl shadow-lg border border-slate-800 flex items-center justify-center text-emerald-500 mb-8 transform group-hover:-translate-y-2 transition-transform duration-300">
                                {step.icon}
                                <span className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-slate-950">
                                    {idx + 1}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
