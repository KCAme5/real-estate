'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { leadsAPI, Lead, CRMStats, Task } from '@/lib/api/leads';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    Users,
    Plus,
    Search,
    Filter,
    Phone,
    Mail,
    Calendar,
    Kanban,
    List,
    Star,
    Clock,
    AlertCircle,
    CheckCircle2,
    MoreVertical,
    Zap,
    TrendingUp,
    MessageCircle,
    LayoutDashboard,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

const STAGES = [
    { id: 'new', label: 'New Lead', color: 'blue' },
    { id: 'contacted', label: 'Contacted', color: 'amber' },
    { id: 'qualified', label: 'Qualified', color: 'purple' },
    { id: 'proposal', label: 'Proposal', color: 'orange' },
    { id: 'negotiation', label: 'Negotiation', color: 'indigo' },
    { id: 'closed_won', label: 'Closed Won', color: 'emerald' }
];

const priorityColors = {
    low: 'text-slate-400 bg-slate-400/10',
    medium: 'text-blue-400 bg-blue-400/10',
    high: 'text-orange-400 bg-orange-400/10',
    urgent: 'text-rose-400 bg-rose-400/10'
};

export default function CRMPage() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<CRMStats | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadsRes, statsRes, tasksRes] = await Promise.all([
                leadsAPI.getAll(),
                leadsAPI.getCRMStats(),
                leadsAPI.getTasks()
            ]);
            setLeads(leadsRes.results || leadsRes || []);
            setStats(statsRes);
            setTasks(tasksRes.results || tasksRes || []);
        } catch (error) {
            console.error('Failed to fetch CRM data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (leadId: number, newStatus: string) => {
        try {
            await leadsAPI.updateLead(leadId, { status: newStatus as any });
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus as any } : l));
            success('Lead updated', `Status moved to ${newStatus}`);
            // Refresh stats
            const statsRes = await leadsAPI.getCRMStats();
            setStats(statsRes);
        } catch (error) {
            showError('Update failed', 'Could not move lead');
        }
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(l =>
            (l.first_name + l.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [leads, searchQuery]);

    if (loading && !leads.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Breadcrumb />
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Users size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Lead Center</h1>
                                <p className="text-slate-500 font-medium">Professional CRM & Pipeline Management</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`p-2 px-4 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Kanban size={16} /> Kanban
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 px-4 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <List size={16} /> List
                            </button>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-white text-black hover:bg-slate-200 px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-xl active:scale-95"
                        >
                            <Plus size={18} strokeWidth={3} /> ADD LEAD
                        </button>
                    </div>
                </div>

                {/* Performance Stats Overlay */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'ACTIVE PIPELINE', val: stats?.total_leads || 0, icon: TrendingUp, color: 'blue' },
                        { label: 'QUALIFIED', val: stats?.qualified_leads || 0, icon: Zap, color: 'amber' },
                        { label: 'AVG LEAD SCORE', val: Math.round(stats?.avg_score || 0), icon: Star, color: 'purple' },
                        { label: 'REVENUE GOAL', val: 'Kes 14M', icon: CheckCircle2, color: 'emerald' }
                    ].map((card, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800/50 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-600/5 blur-[50px] group-hover:bg-${card.color}-600/10 transition-all`} />
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-slate-500 mb-1">{card.label}</p>
                                    <h3 className="text-3xl font-black text-white">{card.val}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl bg-slate-800 text-${card.color}-400`}>
                                    <card.icon size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="flex-1 overflow-x-auto no-scrollbar">
                        {viewMode === 'kanban' ? (
                            <div className="flex gap-6 pb-8 min-w-[1200px]">
                                {STAGES.map(stage => {
                                    const stageLeads = filteredLeads.filter(l => l.status === stage.id);
                                    return (
                                        <div key={stage.id} className="w-[300px] shrink-0 space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full bg-${stage.color}-500 shadow-[0_0_8px] shadow-${stage.color}-500/50`} />
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{stage.label}</h4>
                                                </div>
                                                <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                                            </div>

                                            <div className="min-h-[600px] bg-slate-900/30 border border-slate-800/50 rounded-3xl p-3 space-y-3">
                                                {stageLeads.map(lead => (
                                                    <div
                                                        key={lead.id}
                                                        className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm hover:border-slate-700 hover:translate-y-[-2px] transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-tighter uppercase ${priorityColors[lead.priority || 'low']}`}>
                                                                {lead.priority || 'Low'}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-amber-400 font-black text-[10px]">
                                                                <Star size={10} fill="currentColor" /> {lead.score}
                                                            </div>
                                                        </div>

                                                        <h5 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{lead.first_name} {lead.last_name}</h5>
                                                        <p className="text-xs text-slate-500 mb-4 line-clamp-1">{lead.email}</p>

                                                        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                                                            <div className="flex -space-x-2">
                                                                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#0B0E14] flex items-center justify-center">
                                                                    <Users size={12} className="text-slate-500" />
                                                                </div>
                                                                <div className="w-6 h-6 rounded-full bg-blue-600/20 border-2 border-[#0B0E14] flex items-center justify-center">
                                                                    <MessageCircle size={10} className="text-blue-400" />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => {
                                                                        const nextIdx = STAGES.findIndex(s => s.id === stage.id) + 1;
                                                                        if (nextIdx < STAGES.length) handleUpdateStatus(lead.id, STAGES[nextIdx].id);
                                                                    }}
                                                                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all"
                                                                >
                                                                    <ChevronRight size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {stageLeads.length === 0 && (
                                                    <div className="h-24 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Empty Stage</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-800/30 border-b border-slate-800">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Lead Info</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Source</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Score</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {filteredLeads.map(lead => (
                                            <tr key={lead.id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 font-bold text-slate-400">
                                                            {lead.first_name[0]}{lead.last_name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm tracking-tight capitalize">{lead.first_name} {lead.last_name}</p>
                                                            <p className="text-xs text-slate-500">{lead.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700/50">
                                                        {lead.source}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        <span className="text-xs font-bold text-slate-300 capitalize">{lead.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Star size={14} className="text-amber-400" fill="currentColor" />
                                                        <span className="font-black text-white">{lead.score}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <button className="text-slate-500 hover:text-white p-2">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Tasks & Activity */}
                    <div className="w-full lg:w-[380px] space-y-8">
                        {/* Tasks Section */}
                        <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-black uppercase tracking-[.3em] text-slate-500">TODAY'S MISSIONS</h4>
                                <button className="p-2 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {tasks.filter(t => !t.is_completed).slice(0, 4).map(task => (
                                    <div key={task.id} className="group p-5 bg-slate-950/50 border border-slate-800 rounded-3xl hover:border-slate-700 transition-all">
                                        <div className="flex items-start gap-4">
                                            <button className="mt-1 w-6 h-6 rounded-lg border-2 border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all">
                                                <CheckCircle2 size={12} className="text-transparent group-hover:text-white" />
                                            </button>
                                            <div className="flex-1">
                                                <h6 className="text-[10px] font-black uppercase tracking-tight text-white mb-0.5">{task.title}</h6>
                                                <p className="text-xs text-slate-500 font-medium">{task.description}</p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase">
                                                        <Clock size={10} /> {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                    <div className="text-[9px] font-black text-slate-600 uppercase">Lead ID: #{task.lead}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <div className="text-center py-10">
                                        <CheckCircle2 size={32} className="text-slate-800 mx-auto mb-3" />
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No pending tasks</p>
                                    </div>
                                )}
                            </div>

                            <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black tracking-widest transition-all">
                                VIEW ALL SCHEDULES
                            </button>
                        </section>

                        {/* Recent Alerts */}
                        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                            <ArrowUpRight className="absolute top-[-20px] right-[-20px] text-white/10" size={160} strokeWidth={4} />
                            <div className="relative z-10 space-y-6">
                                <div className="p-3 bg-white/20 w-fit rounded-2xl backdrop-blur-md">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black leading-tight tracking-tight">System assigned <br />3 High-Value Leads</h4>
                                    <p className="text-white/70 text-sm font-medium">Auto-assigned based on your recent performance metrics.</p>
                                </div>
                                <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all">
                                    TAKE ACTION NOW
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
