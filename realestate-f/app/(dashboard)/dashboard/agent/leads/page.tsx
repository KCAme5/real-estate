'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { leadsAPI, Lead } from '@/lib/api/leads';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { Users, Plus, Search, Filter, Phone, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
    'new': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
    'contacted': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    'qualified': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
    'proposal': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300',
    'negotiation': 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300',
    'closed_won': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    'closed_lost': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
};

export default function LeadsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const data = await leadsAPI.getAll();
                const leadsArray = data.results || data || [];
                setLeads(leadsArray);
                setFilteredLeads(leadsArray);
            } catch (error) {
                console.error('Failed to fetch leads:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.user_type === 'agent') {
            fetchLeads();
        }
    }, [user]);

    useEffect(() => {
        let filtered = leads;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(lead => lead.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(lead =>
                lead.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.phone.includes(searchQuery)
            );
        }

        setFilteredLeads(filtered);
    }, [searchQuery, statusFilter, leads]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <Breadcrumb />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Users className="text-primary" size={32} />
                            Leads Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage and track your leads</p>
                    </div>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                        <Plus size={20} />
                        Add Lead
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">All Status</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="proposal">Proposal</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="closed_won">Closed Won</option>
                                <option value="closed_lost">Closed Lost</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground font-medium">Total Leads</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{leads.length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground font-medium">New</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {leads.filter(l => l.status === 'new').length}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground font-medium">Qualified</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                            {leads.filter(l => l.status === 'qualified').length}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground font-medium">Closed Won</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {leads.filter(l => l.status === 'closed_won').length}
                        </p>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Source</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No leads found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-foreground">
                                                    {lead.first_name} {lead.last_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail size={14} />
                                                        {lead.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone size={14} />
                                                        {lead.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-foreground capitalize">{lead.source}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[lead.status] || statusColors['new']}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {lead.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar size={14} />
                                                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
