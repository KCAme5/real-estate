'use client';

import { useState, useEffect } from 'react';
import { agentsAPI } from '@/lib/api/agents';
import { Agent } from '@/types/agent';
import { Search, Filter, Building2, UserCheck, ShieldCheck, Loader2, RefreshCw, Phone, Mail, MapPin, Star, Calendar, CheckCircle, MessageSquare, Award, Users, Zap, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AgentCardSkeleton from '@/components/agents/AgentCardSkeleton';

type ViewMode = 'grid' | 'list';
type SortOption = 'experience' | 'name' | 'rating';

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
    const [selectedExperience, setSelectedExperience] = useState<string>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('experience');
    const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

    const specialties = [
        { value: 'all', label: 'All Specialties', icon: '✨' },
        { value: 'residential', label: 'Residential', icon: '🏠' },
        { value: 'commercial', label: 'Commercial', icon: '🏢' },
        { value: 'luxury', label: 'Luxury', icon: '💎' },
        { value: 'investment', label: 'Investment', icon: '📈' },
        { value: 'rental', label: 'Rental', icon: '🔑' },
        { value: 'land', label: 'Land', icon: '🌍' },
    ];

    const experienceLevels = [
        { value: 'all', label: 'All Experience' },
        { value: 'entry', label: 'Entry (0-2 yrs)' },
        { value: 'mid', label: 'Mid (3-5 yrs)' },
        { value: 'senior', label: 'Senior (5-10 yrs)' },
        { value: 'expert', label: 'Expert (10+ yrs)' },
    ];

    useEffect(() => {
        fetchAgents();
    }, []);

    useEffect(() => {
        filterAgents();
    }, [agents, searchTerm, selectedSpecialty, selectedExperience, sortBy]);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await agentsAPI.getAll();
            if (Array.isArray(data)) {
                setAgents(data);
                setFilteredAgents(data);
            } else if (data && Array.isArray(data.results)) {
                setAgents(data.results);
                setFilteredAgents(data.results);
            } else {
                setAgents([]);
                setFilteredAgents([]);
            }
        } catch (err) {
            console.error('Failed to fetch agents', err);
            setError('Failed to load agents. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filterAgents = () => {
        let filtered = [...agents];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(agent =>
                agent.user_name?.toLowerCase().includes(term) ||
                agent.user_email?.toLowerCase().includes(term) ||
                agent.user_phone?.toLowerCase().includes(term) ||
                agent.specialties?.some(s => s.toLowerCase().includes(term))
            );
        }

        if (selectedSpecialty !== 'all') {
            filtered = filtered.filter(agent =>
                agent.specialties?.some(s => s.toLowerCase() === selectedSpecialty)
            );
        }

        if (selectedExperience !== 'all') {
            filtered = filtered.filter(agent => {
                const exp = agent.years_of_experience || 0;
                switch (selectedExperience) {
                    case 'entry': return exp <= 2;
                    case 'mid': return exp >= 3 && exp <= 5;
                    case 'senior': return exp >= 5 && exp <= 10;
                    case 'expert': return exp > 10;
                    default: return true;
                }
            });
        }

        filtered = filtered.filter(agent => agent.is_verified);

        switch (sortBy) {
            case 'experience':
                filtered.sort((a, b) => (b.years_of_experience || 0) - (a.years_of_experience || 0));
                break;
            case 'name':
                filtered.sort((a, b) => (a.user_name || '').localeCompare(b.user_name || ''));
                break;
            case 'rating':
                filtered.sort((a, b) => {
                    if (a.is_verified !== b.is_verified) return b.is_verified ? 1 : -1;
                    return (b.years_of_experience || 0) - (a.years_of_experience || 0);
                });
                break;
        }

        setFilteredAgents(filtered);
    };

    const getExperienceText = (years?: number) => {
        if (!years) return 'New Agent';
        if (years <= 2) return 'Entry Level';
        if (years <= 5) return 'Mid Level';
        if (years <= 10) return 'Senior';
        return 'Expert';
    };

    const getExperienceColor = (years?: number) => {
        if (!years || years <= 2) return 'from-emerald-500 to-teal-500';
        if (years <= 5) return 'from-teal-500 to-cyan-500';
        if (years <= 10) return 'from-cyan-500 to-emerald-400';
        return 'from-emerald-600 to-teal-600';
    };

    if (error) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-background relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
                </div>
                <div className="max-w-md mx-4 text-center relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <ShieldCheck className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground mb-3">
                        Connection Lost
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        {error}
                    </p>
                    <button
                        onClick={fetchAgents}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-red-500/20 hover:shadow-red-500/40 flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 rounded-full blur-3xl" />
            </div>

            {/* Hero Section with Background Image */}
            <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80"
                        alt="Modern real estate office"
                        className="w-full h-full object-cover opacity-[0.15]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-5xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full border border-white/10 mb-8 backdrop-blur-sm">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                Trusted by 500+ Clients
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1]">
                            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                                Meet Our
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                                Elite Agents
                            </span>
                        </h1>

                        <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                            Connect with Kenya's top real estate professionals. 
                            <span className="text-foreground font-semibold"> Verified expertise,</span> 
                            <span className="text-foreground font-semibold"> local knowledge,</span> 
                            and <span className="text-foreground font-semibold"> proven results.</span>
                        </p>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20">
                                    <Users className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-2xl font-black text-foreground">{agents.length}+</p>
                                    <p className="text-xs text-muted-foreground">Expert Agents</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 flex items-center justify-center border border-teal-500/20">
                                    <CheckCircle className="w-6 h-6 text-teal-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-2xl font-black text-foreground">{agents.filter(a => a.is_verified).length}</p>
                                    <p className="text-xs text-muted-foreground">Verified</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center border border-cyan-500/20">
                                    <Star className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-2xl font-black text-foreground">4.9</p>
                                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search & Filters Section */}
            <section className="relative z-10 -mt-4 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-7xl">
                    <div className="bg-gradient-to-br from-slate-900/95 to-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl shadow-black/20">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-5 relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search agents by name or specialty..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all text-white placeholder:text-slate-500"
                                />
                            </div>

                            {/* Specialty */}
                            <div className="lg:col-span-4 relative">
                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    value={selectedSpecialty}
                                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                                    className="w-full pl-14 pr-10 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all text-white appearance-none cursor-pointer"
                                >
                                    {specialties.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Experience */}
                            <div className="lg:col-span-3 relative">
                                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    value={selectedExperience}
                                    onChange={(e) => setSelectedExperience(e.target.value)}
                                    className="w-full pl-14 pr-10 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all text-white appearance-none cursor-pointer"
                                >
                                    {experienceLevels.map((level) => (
                                        <option key={level.value} value={level.value}>{level.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Active Filters & Controls */}
                        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {(searchTerm || selectedSpecialty !== 'all' || selectedExperience !== 'all') && (
                                    <>
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                                            >
                                                "{searchTerm}" ×
                                            </button>
                                        )}
                                        {selectedSpecialty !== 'all' && (
                                            <button
                                                onClick={() => setSelectedSpecialty('all')}
                                                className="px-4 py-2 bg-teal-500/10 text-teal-400 rounded-xl text-sm font-medium hover:bg-teal-500/20 transition-colors border border-teal-500/20"
                                            >
                                                {selectedSpecialty} ×
                                            </button>
                                        )}
                                        {selectedExperience !== 'all' && (
                                            <button
                                                onClick={() => setSelectedExperience('all')}
                                                className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-sm font-medium hover:bg-cyan-500/20 transition-colors border border-cyan-500/20"
                                            >
                                                {experienceLevels.find(l => l.value === selectedExperience)?.label} ×
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { setSearchTerm(''); setSelectedSpecialty('all'); setSelectedExperience('all'); }}
                                            className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white outline-none cursor-pointer"
                                >
                                    <option value="experience">Sort: Experience</option>
                                    <option value="name">Sort: Name</option>
                                    <option value="rating">Sort: Rating</option>
                                </select>

                                {/* View Mode */}
                                <div className="flex items-center gap-1 p-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
                <div className="container mx-auto max-w-7xl">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {filteredAgents.length} Agents Available
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                All agents are verified professionals
                            </p>
                        </div>
                        <button
                            onClick={fetchAgents}
                            className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 transition-all"
                        >
                            <RefreshCw className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {loading ? (
                        <div className={viewMode === 'grid' 
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            : 'space-y-4'
                        }>
                            {[...Array(6)].map((_, i) => (
                                <AgentCardSkeleton key={i} viewMode={viewMode} />
                            ))}
                        </div>
                    ) : filteredAgents.length === 0 ? (
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-3xl p-16 text-center border border-white/10">
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <UserCheck className="w-12 h-12 text-slate-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-3">
                                No Agents Found
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                                {agents.length === 0
                                    ? "We're expanding our network. Check back soon!"
                                    : "No agents match your criteria. Try adjusting filters."}
                            </p>
                            {agents.length > 0 && (
                                <button
                                    onClick={() => { setSearchTerm(''); setSelectedSpecialty('all'); setSelectedExperience('all'); }}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl transition-all"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAgents.map((agent) => (
                                        <Link
                                            key={agent.id}
                                            href={`/agents/${agent.slug}`}
                                            className="group block"
                                            onMouseEnter={() => setHoveredAgent(agent.id)}
                                            onMouseLeave={() => setHoveredAgent(null)}
                                        >
                                            <div className={`relative bg-gradient-to-br from-slate-900/90 to-slate-900/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/5 transition-all duration-500 ${hoveredAgent === agent.id ? 'border-emerald-500/30 shadow-2xl shadow-emerald-500/10 -translate-y-2' : ''}`}>
                                                {/* Decorative Gradient */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full blur-2xl" />
                                                
                                                <div className="p-6">
                                                    {/* Header */}
                                                    <div className="flex items-start gap-4 mb-5">
                                                        {/* Avatar */}
                                                        <div className="relative shrink-0">
                                                            <div className={`w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br ${getExperienceColor(agent.years_of_experience)} p-0.5 transition-transform duration-500 ${hoveredAgent === agent.id ? 'scale-105' : ''}`}>
                                                                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900">
                                                                    {agent.user_avatar ? (
                                                                        <Image
                                                                            src={agent.user_avatar}
                                                                            alt={agent.user_name || 'Agent'}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                                                            <span className="text-2xl font-black text-white">
                                                                                {agent.user_name?.[0]?.toUpperCase() || 'A'}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {agent.is_verified && (
                                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-slate-900">
                                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`text-lg font-bold text-white truncate transition-colors ${hoveredAgent === agent.id ? 'text-emerald-400' : ''}`}>
                                                                {agent.user_name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs font-semibold text-slate-400">
                                                                    {getExperienceText(agent.years_of_experience)}
                                                                </span>
                                                                <span className="text-slate-600">•</span>
                                                                <span className="text-xs text-slate-500">
                                                                    {agent.years_of_experience || 0} yrs
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Specialties */}
                                                    <div className="flex flex-wrap gap-2 mb-5">
                                                        {agent.specialties?.slice(0, 2).map((specialty, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-3 py-1.5 bg-slate-800/80 text-slate-300 text-xs font-medium rounded-lg border border-slate-700/50"
                                                            >
                                                                {specialty}
                                                            </span>
                                                        ))}
                                                        {agent.specialties && agent.specialties.length > 2 && (
                                                            <span className="px-3 py-1.5 bg-slate-800/50 text-slate-500 text-xs font-medium rounded-lg">
                                                                +{agent.specialties.length - 2}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Bio */}
                                                    <p className="text-sm text-slate-400 line-clamp-2 mb-5">
                                                        {agent.bio || 'Passionate about helping clients find their dream properties across Kenya.'}
                                                    </p>

                                                    {/* Contact */}
                                                    <div className="space-y-2 mb-5">
                                                        {agent.user_phone && (
                                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                                <Phone className="w-4 h-4 text-slate-500" />
                                                                <span className="truncate">{agent.user_phone}</span>
                                                            </div>
                                                        )}
                                                        {agent.user_email && (
                                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                                <Mail className="w-4 h-4 text-slate-500" />
                                                                <span className="truncate">{agent.user_email}</span>
                                                            </div>
                                                        )}
                                                        {agent.office_address && (
                                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                                <MapPin className="w-4 h-4 text-slate-500" />
                                                                <span className="truncate">{agent.office_address}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* CTA */}
                                                    <div className={`flex items-center justify-between pt-4 border-t border-slate-800/50 transition-all duration-500 ${hoveredAgent === agent.id ? 'border-slate-700/50' : ''}`}>
                                                        <span className="text-sm font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors">
                                                            View Profile
                                                        </span>
                                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center transition-all duration-500 ${hoveredAgent === agent.id ? 'bg-emerald-500 scale-110' : ''}`}>
                                                            <ChevronRight className={`w-5 h-5 text-emerald-400 transition-transform ${hoveredAgent === agent.id ? 'translate-x-1' : ''}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* List View */}
                            {viewMode === 'list' && (
                                <div className="space-y-4">
                                    {filteredAgents.map((agent) => (
                                        <Link
                                            key={agent.id}
                                            href={`/agents/${agent.slug}`}
                                            className="group block"
                                            onMouseEnter={() => setHoveredAgent(agent.id)}
                                            onMouseLeave={() => setHoveredAgent(null)}
                                        >
                                            <div className={`relative bg-gradient-to-br from-slate-900/90 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500 ${hoveredAgent === agent.id ? 'border-emerald-500/30 shadow-xl shadow-emerald-500/5 -translate-y-1' : 'border-white/5'}`}>
                                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                                    {/* Avatar */}
                                                    <div className="shrink-0">
                                                        <div className={`w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br ${getExperienceColor(agent.years_of_experience)} p-0.5 transition-transform duration-500 ${hoveredAgent === agent.id ? 'scale-105' : ''}`}>
                                                            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900">
                                                                {agent.user_avatar ? (
                                                                    <Image
                                                                        src={agent.user_avatar}
                                                                        alt={agent.user_name || 'Agent'}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                                                        <span className="text-3xl font-black text-white">
                                                                            {agent.user_name?.[0]?.toUpperCase() || 'A'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                                            <h3 className={`text-xl font-bold text-white transition-colors ${hoveredAgent === agent.id ? 'text-emerald-400' : ''}`}>
                                                                {agent.user_name}
                                                            </h3>
                                                            {agent.is_verified && (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Verified
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                                                            <span className={`px-3 py-1 bg-gradient-to-r ${getExperienceColor(agent.years_of_experience)}/10 text-white/80 text-xs font-semibold rounded-lg`}>
                                                                {getExperienceText(agent.years_of_experience)} • {agent.years_of_experience || 0} yrs
                                                            </span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {agent.specialties?.slice(0, 3).map((s, i) => (
                                                                    <span key={i} className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-lg">
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <p className="text-sm text-slate-400 line-clamp-1 max-w-2xl">
                                                            {agent.bio || 'Passionate about helping clients find their dream properties.'}
                                                        </p>
                                                    </div>

                                                    {/* Contact */}
                                                    <div className="flex flex-wrap items-center gap-6 shrink-0">
                                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                                            {agent.user_phone && (
                                                                <div className="flex items-center gap-2">
                                                                    <Phone className="w-4 h-4" />
                                                                    <span>{agent.user_phone}</span>
                                                                </div>
                                                            )}
                                                            {agent.user_email && (
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="w-4 h-4" />
                                                                    <span className="hidden sm:inline">{agent.user_email}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center transition-all duration-500 ${hoveredAgent === agent.id ? 'bg-emerald-500' : ''}`}>
                                                            <ChevronRight className={`w-5 h-5 text-emerald-400 transition-transform ${hoveredAgent === agent.id ? 'translate-x-1 text-white' : ''}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-3xl p-8 lg:p-12 border border-white/10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                        
                        <div className="relative text-center max-w-2xl mx-auto">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                                Become an Agent
                            </h2>
                            <p className="text-lg text-slate-300 mb-8">
                                Join our network of elite real estate professionals and unlock your potential.
                            </p>
                            <Link
                                href="/register?type=agent"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40"
                            >
                                <Sparkles className="w-5 h-5" />
                                Apply Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}