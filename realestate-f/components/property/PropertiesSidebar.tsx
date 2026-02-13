'use client';

import { TrendingUp, FileText, ArrowRight, Heart, Bell } from 'lucide-react';

export default function PropertiesSidebar() {
    return (
        <div className="space-y-8">

            {/* Trending Areas Widget */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-hidden relative group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Trending Areas</h3>
                </div>

                <div className="space-y-4 relative z-10">
                    {[
                        { name: 'Westlands', growth: '+12%', rank: 1 },
                        { name: 'Karen', growth: '+12%', rank: 2 },
                        { name: 'Nyali', growth: '+12%', rank: 3 },
                        { name: 'Runda', growth: '+12%', rank: 4 },
                    ].map((area) => (
                        <div key={area.name} className="flex items-center justify-between group/item hover:bg-slate-800/50 p-2 rounded-lg transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                                    #{area.rank}
                                </span>
                                <span className="text-slate-300 font-medium group-hover/item:text-white transition-colors">
                                    {area.name}
                                </span>
                            </div>
                            <span className="text-emerald-400 text-sm font-bold">{area.growth}</span>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-6 py-3 border border-slate-700 rounded-xl text-slate-300 font-semibold hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                    <FileText size={16} />
                    Market Report
                </button>
            </div>

            {/* Saved Searches Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saved Searches</h3>
                    <Bell size={18} className="text-slate-400" />
                </div>

                <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-dotted border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-sm group-hover:text-emerald-500 transition-colors">3BHK Apartment Nyali</h4>
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        </div>
                        <p className="text-xs text-slate-500">Updated 2h ago</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-dotted border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-sm group-hover:text-emerald-500 transition-colors">Villas in Karen & Runda</h4>
                        </div>
                        <p className="text-xs text-slate-500">Updated 1d ago</p>
                    </div>
                </div>
            </div>

            {/* Support CTA */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-8 text-center relative overflow-hidden shadow-xl group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors duration-500"></div>

                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">Need Expert Help?</h3>
                    <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
                        Talk to our property advisors for personalized recommendations.
                    </p>

                    <button className="bg-white text-emerald-700 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-emerald-50 transition-colors shadow-lg">
                        CONTACT SUPPORT
                    </button>
                </div>
            </div>

        </div>
    );
}
