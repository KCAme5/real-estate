'use client';

import { useState, useEffect } from 'react';
import { agentsAPI } from '@/lib/api/agents';
import { Agent } from '@/types/agent';
import { Search, Filter, Building2, UserCheck, ShieldCheck, Loader2, RefreshCw, Phone, Mail, MapPin, Star, Calendar, CheckCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AgentCardSkeleton from '@/components/agents/AgentCardSkeleton';

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
    const [selectedExperience, setSelectedExperience] = useState<string>('all');

    const specialties = [
        'Residential',
        'Commercial',
        'Luxury',
        'Investment',
        'Rental',
        'Industrial',
        'Land',
        'All'
    ];

    const experienceLevels = [
        'All',
        'Entry (0-2 years)',
        'Mid (3-5 years)',
        'Senior (5-10 years)',
        'Expert (10+ years)'
    ];

    useEffect(() => {
        fetchAgents();
    }, []);

    useEffect(() => {
        filterAgents();
    }, [agents, searchTerm, selectedSpecialty, selectedExperience]);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await agentsAPI.getAll();
            // Handle both paginated and non-paginated responses
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

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(agent =>
                agent.user_name?.toLowerCase().includes(term) ||
                agent.user_email?.toLowerCase().includes(term) ||
                agent.user_phone?.toLowerCase().includes(term) ||
                agent.specialties?.some(s => s.toLowerCase().includes(term))
            );
        }

        // Specialty filter
        if (selectedSpecialty !== 'all') {
            filtered = filtered.filter(agent =>
                agent.specialties?.includes(selectedSpecialty)
            );
        }

        // Experience filter (simplified example)
        if (selectedExperience !== 'all') {
            filtered = filtered.filter(agent => {
                const exp = agent.years_of_experience || 0;
                switch (selectedExperience) {
                    case 'Entry (0-2 years)': return exp <= 2;
                    case 'Mid (3-5 years)': return exp >= 3 && exp <= 5;
                    case 'Senior (5-10 years)': return exp >= 5 && exp <= 10;
                    case 'Expert (10+ years)': return exp > 10;
                    default: return true;
                }
            });
        }

        // Strictly show only verified agents
        filtered = filtered.filter(agent => agent.is_verified);

        setFilteredAgents(filtered);
    };

    // Format experience text
    const getExperienceText = (years?: number) => {
        if (!years) return 'New Agent';
        if (years === 1) return '1 year experience';
        return `${years} years experience`;
    };



    if (error) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-background">
                <div className="max-w-md mx-4 text-center">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Connection Issue
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {error}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={fetchAgents}
                            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-muted hover:bg-muted/80 text-muted-foreground font-medium rounded-lg transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-16 bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-secondary/5" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-4xl mx-auto text-center py-12 lg:py-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                            <UserCheck className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Professional Network
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                            Meet Our Expert
                            <span className="text-primary"> Real Estate </span>
                            Agents
                        </h1>
                        <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                            Connect with our verified professional agents who specialize in helping you find,
                            buy, sell, or invest in properties across Kenya.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Verified Profiles</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>24/7 Support</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>Local Expertise</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="bg-card rounded-2xl shadow-xl p-6 mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search agents by name, email, or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-ring/20 focus:border-transparent outline-none transition-all text-foreground"
                            />
                        </div>

                        {/* Specialty Filter */}
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-ring/20 focus:border-transparent outline-none appearance-none transition-all text-foreground"
                            >
                                {specialties.map((specialty) => (
                                    <option key={specialty} value={specialty.toLowerCase()}>
                                        {specialty === 'all' ? 'All Specialties' : specialty}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Experience Filter */}
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <select
                                value={selectedExperience}
                                onChange={(e) => setSelectedExperience(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-ring/20 focus:border-transparent outline-none appearance-none transition-all text-foreground"
                            >
                                {experienceLevels.map((level) => (
                                    <option key={level} value={level}>
                                        {level === 'all' ? 'All Experience Levels' : level}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(searchTerm || selectedSpecialty !== 'all' || selectedExperience !== 'all') && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">Active filters:</span>
                            {searchTerm && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                                    Search: "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-1 text-primary/70 hover:text-primary"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {selectedSpecialty !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm rounded-full">
                                    {selectedSpecialty}
                                    <button
                                        onClick={() => setSelectedSpecialty('all')}
                                        className="ml-1 text-emerald-500 hover:text-emerald-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {selectedExperience !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm rounded-full">
                                    {selectedExperience}
                                    <button
                                        onClick={() => setSelectedExperience('all')}
                                        className="ml-1 text-purple-500 hover:text-purple-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedSpecialty('all');
                                    setSelectedExperience('all');
                                }}
                                className="text-sm text-muted-foreground hover:text-foreground underline"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Agents List */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <AgentCardSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredAgents.length === 0 ? (
                    <div className="bg-card rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <UserCheck className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            No Agents Found
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            {agents.length === 0
                                ? "We're currently expanding our network of professional agents. Check back soon!"
                                : "No agents match your search criteria. Try adjusting your filters."}
                        </p>
                        {agents.length > 0 && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedSpecialty('all');
                                    setSelectedExperience('all');
                                }}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Results Summary */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    Available Agents
                                </h2>
                                <p className="text-muted-foreground">
                                    Showing {filteredAgents.length} of {agents.length} professional agents
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Sorted by:</span>
                                <span className="font-medium text-foreground">Verified Status</span>
                            </div>
                        </div>

                        {/* Horizontal Agents List */}
                        <div className="space-y-6">
                            {filteredAgents.map((agent) => (
                                <Link
                                    key={agent.id}
                                    href={`/agents/${agent.slug}`}
                                    className="block group bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-border hover:border-primary/50"
                                >
                                    <div className="p-4 md:p-6">
                                        <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
                                            {/* Agent Avatar & Basic Info */}
                                            <div className="shrink-0">
                                                <div className="relative">
                                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-linear-to-br from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 p-1">
                                                        {agent.user_avatar ? (
                                                            <div className="w-full h-full rounded-xl overflow-hidden">
                                                                <Image
                                                                    src={agent.user_avatar}
                                                                    alt={agent.user_name || 'Agent'}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full rounded-xl bg-linear-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                                                                <span className="text-2xl font-bold text-white">
                                                                    {agent.user_name?.[0]?.toUpperCase() || 'A'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {agent.is_verified && (
                                                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800">
                                                            <CheckCircle className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Agent Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl md:text-2xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                                {agent.user_name}
                                                            </h3>
                                                            {agent.is_verified && (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-full">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Verified
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                                            {agent.specialties?.[0] && (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                                                    <Building2 className="w-3 h-3" />
                                                                    {agent.specialties[0]}
                                                                </span>
                                                            )}
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium rounded-full">
                                                                <Calendar className="w-3 h-3" />
                                                                {getExperienceText(agent.years_of_experience)}
                                                            </span>
                                                        </div>

                                                        <p className="text-muted-foreground line-clamp-1 md:line-clamp-2 text-sm mb-3">
                                                            {agent.bio}
                                                        </p>
                                                    </div>

                                                    {/* Contact & Action Buttons removed for listing view */}
                                                </div>

                                                {/* Contact Info & Specialties */}
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-border">
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        {agent.user_email && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Mail className="w-4 h-4" />
                                                                <span className="text-sm truncate max-w-[200px]">{agent.user_email}</span>
                                                            </div>
                                                        )}
                                                        {agent.user_phone && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Phone className="w-4 h-4" />
                                                                <span className="text-sm">{agent.user_phone}</span>
                                                            </div>
                                                        )}
                                                        {agent.office_address && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <MapPin className="w-4 h-4" />
                                                                <span className="text-sm truncate max-w-[200px]">{agent.office_address}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Specialties Tags */}
                                                <div className="flex flex-wrap gap-2">
                                                    {agent.specialties?.slice(0, 3).map((specialty, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full"
                                                        >
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                    {agent.specialties && agent.specialties.length > 3 && (
                                                        <span className="px-3 py-1 bg-muted text-muted-foreground/70 text-xs font-medium rounded-full">
                                                            +{agent.specialties.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Stats Footer */}
                        <div className="mt-12 pt-8 border-t border-border">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-card rounded-xl shadow-sm">
                                    <div className="text-3xl font-bold text-primary mb-2">
                                        {agents.length}+
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Professional Agents
                                    </div>
                                </div>
                                <div className="text-center p-6 bg-card rounded-xl shadow-sm">
                                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                                        {agents.filter(a => a.is_verified).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Verified Agents
                                    </div>
                                </div>
                                <div className="text-center p-6 bg-card rounded-xl shadow-sm">
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                                        24/7
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Support Available
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="bg-linear-to-r from-primary to-secondary rounded-2xl p-8 lg:p-12 text-center text-white">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                        Want to Join Our Network of Agents?
                    </h3>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        Partner with KenyaPrime Properties and reach thousands of potential clients.
                        Join our network of trusted real estate professionals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register?user_type=agent"
                            className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            Become an Agent
                        </Link>
                        <Link
                            href="/contact"
                            className="px-6 py-3 bg-transparent border-2 border-white hover:bg-white/10 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            Contact Our Team
                        </Link>
                    </div>
                </div>
            </div>
        </main >
    );
}