'use client';

import { useState, useEffect } from 'react';
import { agentsAPI } from '@/lib/api/agents';
import { Agent } from '@/types/agent';
import { Search, Filter, Building2, UserCheck, ShieldCheck, Loader2, RefreshCw, Phone, Mail, MapPin, Star, Calendar, CheckCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Loading Professional Agents
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Finding the best real estate experts for you...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                <div className="max-w-md mx-4 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Connection Issue
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {error}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={fetchAgents}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 dark:from-blue-900/20 dark:to-emerald-900/20" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-4xl mx-auto text-center py-12 lg:py-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Professional Network
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                            Meet Our Expert
                            <span className="text-blue-600 dark:text-blue-400"> Real Estate </span>
                            Agents
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                            Connect with our verified professional agents who specialize in helping you find,
                            buy, sell, or invest in properties across Kenya.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search agents by name, email, or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Specialty Filter */}
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all"
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
                            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={selectedExperience}
                                onChange={(e) => setSelectedExperience(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all"
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
                            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                            {searchTerm && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                                    Search: "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-1 text-blue-500 hover:text-blue-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {selectedSpecialty !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                                    {selectedSpecialty}
                                    <button
                                        onClick={() => setSelectedSpecialty('all')}
                                        className="ml-1 text-green-500 hover:text-green-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {selectedExperience !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                                    {selectedExperience}
                                    <button
                                        onClick={() => setSelectedExperience('all')}
                                        className="ml-1 text-purple-500 hover:text-purple-700"
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
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Agents List */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {filteredAgents.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <UserCheck className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            No Agents Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
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
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Available Agents
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Showing {filteredAgents.length} of {agents.length} professional agents
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Sorted by:</span>
                                <span className="font-medium text-gray-900 dark:text-white">Verified Status</span>
                            </div>
                        </div>

                        {/* Horizontal Agents List */}
                        <div className="space-y-6">
                            {filteredAgents.map((agent) => (
                                <Link
                                    key={agent.id}
                                    href={`/agents/${agent.slug}`}
                                    className="block group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-500/50 dark:hover:border-blue-400/50"
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                            {/* Agent Avatar & Basic Info */}
                                            <div className="flex-shrink-0">
                                                <div className="relative">
                                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 p-1">
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
                                                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
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
                                                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {agent.user_name}
                                                            </h3>
                                                            {agent.is_verified && (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-full">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Verified
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                                            {agent.specialties?.[0] && (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                                                                    <Building2 className="w-3 h-3" />
                                                                    {agent.specialties[0]}
                                                                </span>
                                                            )}
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full">
                                                                <Calendar className="w-3 h-3" />
                                                                {getExperienceText(agent.years_of_experience)}
                                                            </span>
                                                            {agent.average_rating && (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-full">
                                                                    <Star className="w-3 h-3" />
                                                                    {typeof agent.average_rating === 'number' ? agent.average_rating.toFixed(1) : parseFloat(agent.average_rating as string).toFixed(1)}/5.0
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                                            {agent.bio}
                                                        </p>
                                                    </div>

                                                    {/* Contact & Action Buttons removed for listing view */}
                                                </div>

                                                {/* Contact Info & Specialties */}
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        {agent.user_email && (
                                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                <Mail className="w-4 h-4" />
                                                                <span className="text-sm truncate max-w-[200px]">{agent.user_email}</span>
                                                            </div>
                                                        )}
                                                        {agent.user_phone && (
                                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                                <Phone className="w-4 h-4" />
                                                                <span className="text-sm">{agent.user_phone}</span>
                                                            </div>
                                                        )}
                                                        {agent.office_address && (
                                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
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
                                                            className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"
                                                        >
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                    {agent.specialties && agent.specialties.length > 3 && (
                                                        <span className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-full">
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
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                        {agents.length}+
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Professional Agents
                                    </div>
                                </div>
                                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                                        {agents.filter(a => a.is_verified).length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Verified Agents
                                    </div>
                                </div>
                                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                                        24/7
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
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
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 lg:p-12 text-center text-white">
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