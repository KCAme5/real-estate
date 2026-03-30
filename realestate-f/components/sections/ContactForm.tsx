// components/sections/ContactFormSection.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Phone, ShieldCheck, Timer } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
    propertyInterest: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactFormSection() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            console.log('Form data:', data);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSubmitSuccess(true);
            reset();
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="relative bg-slate-950 py-16 sm:py-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.10),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.08),transparent_40%)]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                    <div className="lg:col-span-7">
                        <div className="mb-6 sm:mb-8">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                                Contact Form
                            </div>
                            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white tracking-tight">
                                Send us a message
                            </h2>
                            <p className="mt-3 text-slate-300 leading-relaxed">
                                Tell us what you need — buying, selling, valuations, or viewings. We’ll respond within 24 hours on business days.
                            </p>
                        </div>

                        {submitSuccess && (
                            <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-200 rounded-2xl border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                                        <ShieldCheck className="text-emerald-200" size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Message received</p>
                                        <p className="text-sm text-slate-300">We’ll get back to you shortly.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-900/55 backdrop-blur rounded-3xl border border-slate-800 shadow-2xl shadow-black/20 p-6 sm:p-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('name')}
                                            className={`w-full px-4 py-3.5 rounded-2xl bg-slate-950/60 text-white placeholder:text-slate-500 border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all ${errors.name ? 'border-red-500/60' : 'border-slate-800'}`}
                                            placeholder="John Doe"
                                            autoComplete="name"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            {...register('email')}
                                            className={`w-full px-4 py-3.5 rounded-2xl bg-slate-950/60 text-white placeholder:text-slate-500 border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all ${errors.email ? 'border-red-500/60' : 'border-slate-800'}`}
                                            placeholder="john@example.com"
                                            autoComplete="email"
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            {...register('phone')}
                                            className={`w-full px-4 py-3.5 rounded-2xl bg-slate-950/60 text-white placeholder:text-slate-500 border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all ${errors.phone ? 'border-red-500/60' : 'border-slate-800'}`}
                                            placeholder="+254 7XX XXX XXX"
                                            autoComplete="tel"
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('subject')}
                                            className={`w-full px-4 py-3.5 rounded-2xl bg-slate-950/60 text-white placeholder:text-slate-500 border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all ${errors.subject ? 'border-red-500/60' : 'border-slate-800'}`}
                                            placeholder="How can we help?"
                                        />
                                        {errors.subject && <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Property Interest (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        {...register('propertyInterest')}
                                        className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/60 text-white placeholder:text-slate-500 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                                        placeholder="Reference, location, or property type"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        {...register('message')}
                                        className={`w-full px-4 py-3.5 rounded-2xl bg-slate-950/60 text-white placeholder:text-slate-500 border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all ${errors.message ? 'border-red-500/60' : 'border-slate-800'}`}
                                        placeholder="Tell us more about your requirements..."
                                        rows={5}
                                    />
                                    {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-white text-slate-950 py-4 px-6 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 shadow-xl shadow-black/20 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-3">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Sending…
                                            </span>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                    <p className="mt-3 text-xs sm:text-sm text-slate-400 text-center">
                                        By submitting, you agree to our Privacy Policy and Terms of Service.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-28 space-y-6">
                            <div className="bg-slate-900/35 border border-slate-800 rounded-3xl p-6 sm:p-8">
                                <h3 className="text-xl sm:text-2xl font-black text-white mb-6">Quick contacts</h3>
                                <div className="space-y-3">
                                    <a
                                        href="tel:+254712345678"
                                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/60 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-200">
                                                <Phone size={18} />
                                            </span>
                                            <div>
                                                <p className="font-bold text-white">Call</p>
                                                <p className="text-sm text-slate-300">+254 712 345 678</p>
                                            </div>
                                        </div>
                                        <ArrowMark />
                                    </a>

                                    <a
                                        href="mailto:info@tugairealtors.co.ke"
                                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/60 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-200">
                                                <Mail size={18} />
                                            </span>
                                            <div>
                                                <p className="font-bold text-white">Email</p>
                                                <p className="text-sm text-slate-300">info@tugairealtors.co.ke</p>
                                            </div>
                                        </div>
                                        <ArrowMark />
                                    </a>
                                </div>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                                        <div className="flex items-center gap-2 text-emerald-200">
                                            <Timer size={16} />
                                            <p className="text-xs font-black uppercase tracking-widest">Response</p>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-300">Within 24 hours (business days)</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                                        <div className="flex items-center gap-2 text-emerald-200">
                                            <ShieldCheck size={16} />
                                            <p className="text-xs font-black uppercase tracking-widest">Professional</p>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-300">Trusted guidance and transparency</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500/10 to-slate-900/40 border border-emerald-500/20 rounded-3xl p-6 sm:p-8">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-white text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg text-white mb-1">Urgent help?</h4>
                                        <p className="text-slate-300">Call our priority line for time-sensitive requests.</p>
                                        <a
                                            href="tel:+254712345678"
                                            className="mt-3 inline-flex items-center gap-2 font-black text-white hover:text-emerald-200 transition-colors"
                                        >
                                            +254 712 345 678
                                            <ArrowMark small />
                                        </a>
                                        <p className="mt-2 text-sm text-slate-300">24/7 Available</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ArrowMark({ small }: { small?: boolean }) {
    return (
        <svg
            className={small ? 'w-4 h-4 opacity-80' : 'w-5 h-5 opacity-80'}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    );
}
