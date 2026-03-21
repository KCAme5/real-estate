'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { leadsAPI, Lead, CRMStats, Task } from '@/lib/api/leads';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    Users, Plus, Search, Phone, Mail, Calendar, Kanban, List,
    Star, Clock, AlertCircle, CheckCircle2, MoreVertical, Zap,
    TrendingUp, MessageCircle, ChevronRight, ArrowUpRight,
    Trophy, XCircle, Flame, Building2, ChevronDown, X,
    GripVertical, Eye, Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGES = [
    { id: 'new', label: 'New', shortLabel: 'New', accent: '#3B82F6', dim: 'rgba(59,130,246,0.08)' },
    { id: 'contacted', label: 'Contacted', shortLabel: 'Contacted', accent: '#F59E0B', dim: 'rgba(245,158,11,0.08)' },
    { id: 'viewing', label: 'Viewing', shortLabel: 'Viewing', accent: '#8B5CF6', dim: 'rgba(139,92,246,0.08)' },
    { id: 'qualified', label: 'Qualified', shortLabel: 'Qualified', accent: '#06B6D4', dim: 'rgba(6,182,212,0.08)' },
    { id: 'proposal', label: 'Proposal', shortLabel: 'Proposal', accent: '#F97316', dim: 'rgba(249,115,22,0.08)' },
    { id: 'negotiation', label: 'Negotiation', shortLabel: 'Neg.', accent: '#6366F1', dim: 'rgba(99,102,241,0.08)' },
    { id: 'closed_won', label: 'Won', shortLabel: 'Won', accent: '#10B981', dim: 'rgba(16,185,129,0.08)' },
    { id: 'closed_lost', label: 'Lost', shortLabel: 'Lost', accent: '#EF4444', dim: 'rgba(239,68,68,0.08)' },
] as const;

type StageId = typeof STAGES[number]['id'];

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    low: { label: 'Low', color: 'text-slate-400', dot: '#64748B' },
    medium: { label: 'Med', color: 'text-blue-400', dot: '#3B82F6' },
    high: { label: 'High', color: 'text-orange-400', dot: '#F97316' },
    urgent: { label: 'Urgent', color: 'text-rose-400', dot: '#F43F5E' },
};

function daysAgo(dateStr: string): number {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function initials(first: string, last: string): string {
    return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

// ─── Lead Card ───────────────────────────────────────────────────────────────

interface LeadCardProps {
    lead: Lead;
    stageAccent: string;
    onStatusChange: (id: number, status: string) => void;
    onOpenChat: (lead: Lead) => void;
    onAddTask: (lead: Lead) => void;
    onMarkWon: (id: number) => void;
    onMarkLost: (id: number) => void;
    isDragging: boolean;
    dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
}

function LeadCard({
    lead, stageAccent, onStatusChange, onOpenChat,
    onAddTask, onMarkWon, onMarkLost, isDragging, dragHandleProps
}: LeadCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const pc = PRIORITY_CONFIG[lead.priority ?? 'low'];
    const days = daysAgo(lead.updated_at ?? lead.created_at);
    const isHot = (lead.score ?? 0) >= 50;
    const router = useRouter();

    useEffect(() => {
        function close(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        }
        if (menuOpen) document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [menuOpen]);

    const stageIdx = STAGES.findIndex(s => s.id === lead.status);
    const nextStage = STAGES[stageIdx + 1];

    return (
        <div
            className={`
                group relative rounded-2xl border transition-all duration-200 select-none
                ${isDragging
                    ? 'shadow-2xl scale-[1.02] rotate-1 border-slate-600 bg-slate-800'
                    : 'bg-[#0D1117] border-slate-800/70 hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40'}
            `}
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
        >
            {/* Hot glow top strip */}
            {isHot && (
                <div
                    className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${stageAccent}, transparent)` }}
                />
            )}

            <div className="p-4 space-y-3">
                {/* Row 1: priority + score + drag + menu */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: pc.dot, boxShadow: `0 0 6px ${pc.dot}` }}
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${pc.color}`}>
                            {pc.label}
                        </span>
                        {isHot && (
                            <span className="flex items-center gap-0.5 text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                                <Flame size={8} fill="currentColor" /> HOT
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            {...dragHandleProps}
                            className="p-1 text-slate-700 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <GripVertical size={14} />
                        </div>
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
                                className="p-1 text-slate-600 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-all"
                            >
                                <MoreVertical size={14} />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 top-6 w-44 bg-[#161B22] border border-slate-700/70 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                                    {[
                                        { label: 'Open chat', icon: MessageCircle, action: () => { onOpenChat(lead); setMenuOpen(false); } },
                                        { label: 'Add task', icon: Calendar, action: () => { onAddTask(lead); setMenuOpen(false); } },
                                        { label: 'View property', icon: Eye, action: () => { if (lead.property) router.push(`/properties/${lead.property}`); setMenuOpen(false); } },
                                        { label: 'Mark won', icon: Trophy, action: () => { onMarkWon(lead.id); setMenuOpen(false); } },
                                        { label: 'Mark lost', icon: XCircle, action: () => { onMarkLost(lead.id); setMenuOpen(false); } },
                                    ].map(item => (
                                        <button
                                            key={item.label}
                                            onClick={item.action}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors text-left"
                                        >
                                            <item.icon size={13} className="text-slate-500" />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: property thumbnail + name */}
                <div className="flex items-center gap-3">
                    {lead.property_image ? (
                        <img
                            src={lead.property_image}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-700/50"
                        />
                    ) : (
                        <div
                            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black border border-slate-700/50"
                            style={{ background: `${stageAccent}18`, color: stageAccent }}
                        >
                            {initials(lead.first_name, lead.last_name)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h5 className="text-sm font-bold text-white truncate leading-tight">
                            {lead.first_name} {lead.last_name}
                        </h5>
                        {lead.property_title ? (
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                <Building2 size={9} className="flex-shrink-0" />
                                {lead.property_title}
                            </p>
                        ) : (
                            <p className="text-[11px] text-slate-600 truncate mt-0.5">{lead.email}</p>
                        )}
                    </div>
                </div>

                {/* Row 3: last message preview */}
                {lead.last_message && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed border-l-2 border-slate-700 pl-2">
                        {lead.last_message}
                    </p>
                )}

                {/* Row 4: score + days in stage */}
                <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star size={10} fill="currentColor" />
                        <span>{lead.score ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                        <Clock size={9} />
                        <span>{days === 0 ? 'Today' : `${days}d`}</span>
                    </div>
                </div>

                {/* Row 5: actions bar */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/70">
                    <button
                        onClick={() => onOpenChat(lead)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        title="Open chat"
                    >
                        <MessageCircle size={12} />
                        Chat
                    </button>
                    <button
                        onClick={() => onAddTask(lead)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        title="Add task"
                    >
                        <Calendar size={12} />
                        Task
                    </button>
                    {nextStage && nextStage.id !== 'closed_lost' && (
                        <button
                            onClick={() => onStatusChange(lead.id, nextStage.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all hover:text-white hover:bg-slate-800"
                            style={{ color: nextStage.accent }}
                            title={`Move to ${nextStage.label}`}
                        >
                            <ChevronRight size={12} />
                            {nextStage.shortLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface ColumnProps {
    stage: typeof STAGES[number];
    leads: Lead[];
    onDragStart: (e: React.DragEvent, lead: Lead) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, stageId: string) => void;
    onDragEnd: () => void;
    draggingId: number | null;
    onStatusChange: (id: number, status: string) => void;
    onOpenChat: (lead: Lead) => void;
    onAddTask: (lead: Lead) => void;
    onMarkWon: (id: number) => void;
    onMarkLost: (id: number) => void;
}

function KanbanColumn({
    stage, leads, onDragStart, onDragOver, onDrop, onDragEnd,
    draggingId, onStatusChange, onOpenChat, onAddTask, onMarkWon, onMarkLost
}: ColumnProps) {
    const [isOver, setIsOver] = useState(false);

    return (
        <div className="w-[272px] flex-shrink-0 flex flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: stage.accent, boxShadow: `0 0 8px ${stage.accent}80` }}
                    />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        {stage.label}
                    </span>
                </div>
                <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: stage.dim, color: stage.accent }}
                >
                    {leads.length}
                </span>
            </div>

            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
                onDragLeave={() => setIsOver(false)}
                onDrop={(e) => { setIsOver(false); onDrop(e, stage.id); }}
                className="flex-1 min-h-[560px] rounded-2xl p-2.5 space-y-2.5 transition-all duration-200"
                style={{
                    background: isOver ? stage.dim : 'rgba(15,20,30,0.4)',
                    border: `1px solid ${isOver ? stage.accent + '40' : 'rgba(30,41,59,0.5)'}`,
                    boxShadow: isOver ? `inset 0 0 20px ${stage.accent}10` : 'none',
                }}
            >
                {leads.map(lead => (
                    <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, lead)}
                        onDragEnd={onDragEnd}
                        style={{ opacity: draggingId === lead.id ? 0.4 : 1 }}
                    >
                        <LeadCard
                            lead={lead}
                            stageAccent={stage.accent}
                            onStatusChange={onStatusChange}
                            onOpenChat={onOpenChat}
                            onAddTask={onAddTask}
                            onMarkWon={onMarkWon}
                            onMarkLost={onMarkLost}
                            isDragging={draggingId === lead.id}
                            dragHandleProps={{ style: { cursor: 'grab' } }}
                        />
                    </div>
                ))}
                {leads.length === 0 && (
                    <div
                        className="h-20 rounded-xl border-2 border-dashed flex items-center justify-center mt-1"
                        style={{ borderColor: `${stage.accent}20` }}
                    >
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: `${stage.accent}40` }}>
                            Drop here
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────

interface AddTaskModalProps {
    lead: Lead | null;
    onClose: () => void;
    onSave: (task: { title: string; description: string; due_date: string; priority: string }) => void;
}

function AddTaskModal({ lead, onClose, onSave }: AddTaskModalProps) {
    const [form, setForm] = useState({ title: '', description: '', due_date: '', priority: 'medium' });
    if (!lead) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        >
            <div className="bg-[#0D1117] border border-slate-700/70 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Add Task</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={16} /></button>
                </div>
                <p className="text-xs text-slate-500">For: <span className="text-slate-300 font-bold">{lead.first_name} {lead.last_name}</span></p>
                {[
                    { label: 'Title', key: 'title', type: 'text', placeholder: 'e.g. Follow up call' },
                    { label: 'Notes', key: 'description', type: 'text', placeholder: 'Optional details' },
                    { label: 'Due date', key: 'due_date', type: 'datetime-local', placeholder: '' },
                ].map(f => (
                    <div key={f.key} className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{f.label}</label>
                        <input
                            type={f.type}
                            placeholder={f.placeholder}
                            value={(form as any)[f.key]}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                ))}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Priority</label>
                    <select
                        value={form.priority}
                        onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button
                        onClick={() => { onSave(form); onClose(); }}
                        disabled={!form.title || !form.due_date}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-xs font-black text-white hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Save Task
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CRMPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { success, error: showError } = useToast();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<CRMStats | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [draggingLead, setDraggingLead] = useState<Lead | null>(null);
    const [taskLead, setTaskLead] = useState<Lead | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => { fetchData(); }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadsRes, statsRes, tasksRes] = await Promise.all([
                leadsAPI.getAll(),
                leadsAPI.getCRMStats(),
                leadsAPI.getTasks(),
            ]);
            setLeads(Array.isArray(leadsRes) ? leadsRes : leadsRes.results ?? []);
            setStats(statsRes);
            setTasks(Array.isArray(tasksRes) ? tasksRes : tasksRes.results ?? []);
        } catch {
            showError('Failed to load', 'Could not fetch CRM data');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = useCallback(async (leadId: number, newStatus: string) => {
        const prev = leads.find(l => l.id === leadId)?.status;
        setLeads(p => p.map(l => l.id === leadId ? { ...l, status: newStatus as any } : l));
        setUpdatingId(leadId);
        try {
            await leadsAPI.updateLead(leadId, { status: newStatus as any });
            const label = STAGES.find(s => s.id === newStatus)?.label ?? newStatus;
            success('Lead moved', `Pipeline updated → ${label}`);
            const statsRes = await leadsAPI.getCRMStats();
            setStats(statsRes);
        } catch {
            setLeads(p => p.map(l => l.id === leadId ? { ...l, status: prev as any } : l));
            showError('Update failed', 'Could not move lead');
        } finally {
            setUpdatingId(null);
        }
    }, [leads]);

    // Drag-and-drop
    const onDragStart = useCallback((e: React.DragEvent, lead: Lead) => {
        setDraggingId(lead.id);
        setDraggingLead(lead);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const onDrop = useCallback((e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        if (draggingLead && draggingLead.status !== stageId) {
            handleStatusChange(draggingLead.id, stageId);
        }
        setDraggingId(null);
        setDraggingLead(null);
    }, [draggingLead, handleStatusChange]);

    const onDragEnd = useCallback(() => {
        setDraggingId(null);
        setDraggingLead(null);
    }, []);

    const handleAddTask = async (taskData: { title: string; description: string; due_date: string; priority: string }) => {
        if (!taskLead) return;
        try {
            const newTask = await leadsAPI.createTask({
                ...taskData,
                lead: taskLead.id,
                priority: taskData.priority as 'low' | 'medium' | 'high',
            });
            setTasks(p => [newTask, ...p]);
            success('Task added', `Task created for ${taskLead.first_name}`);
        } catch {
            showError('Failed', 'Could not create task');
        }
    };

    const handleOpenChat = useCallback((lead: Lead) => {
        router.push(`/dashboard/messages?lead=${lead.id}`);
    }, [router]);

    const handleMarkWon = useCallback((id: number) => handleStatusChange(id, 'closed_won'), [handleStatusChange]);
    const handleMarkLost = useCallback((id: number) => handleStatusChange(id, 'closed_lost'), [handleStatusChange]);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return q
            ? leads.filter(l =>
                `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
                l.email.toLowerCase().includes(q) ||
                (l.phone ?? '').includes(q)
            )
            : leads;
    }, [leads, searchQuery]);

    const statCards = [
        { label: 'Pipeline', val: stats?.total_leads ?? 0, icon: TrendingUp, color: '#3B82F6' },
        { label: 'Qualified', val: stats?.qualified_leads ?? 0, icon: Zap, color: '#8B5CF6' },
        { label: 'Avg score', val: Math.round(stats?.avg_score ?? 0), icon: Star, color: '#F59E0B' },
        { label: 'Closed won', val: stats?.closed_won ?? 0, icon: Trophy, color: '#10B981' },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617]">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
            <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <Breadcrumb />
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>
                                <Users size={22} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight">Lead Center</h1>
                                <p className="text-slate-500 text-sm">CRM & Pipeline Management</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 w-52 transition-colors"
                            />
                        </div>

                        {/* View toggle */}
                        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                            {(['kanban', 'list'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${viewMode === mode ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {mode === 'kanban' ? <Kanban size={13} /> : <List size={13} />}
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => router.push('/dashboard/leads/new')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95 shadow-lg"
                            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            New Lead
                        </button>
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-slate-800/60 p-5 flex items-center justify-between"
                            style={{ background: '#0D1117' }}
                        >
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{card.label}</p>
                                <p className="text-3xl font-black text-white">{card.val}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: `${card.color}18` }}>
                                <card.icon size={18} style={{ color: card.color }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main layout ── */}
                <div className="flex gap-6">

                    {/* Kanban / List */}
                    <div className="flex-1 min-w-0">
                        {viewMode === 'kanban' ? (
                            <div className="overflow-x-auto pb-4">
                                <div className="flex gap-4 w-max">
                                    {STAGES.map(stage => (
                                        <KanbanColumn
                                            key={stage.id}
                                            stage={stage}
                                            leads={filtered.filter(l => l.status === stage.id)}
                                            onDragStart={onDragStart}
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={onDrop}
                                            onDragEnd={onDragEnd}
                                            draggingId={draggingId}
                                            onStatusChange={handleStatusChange}
                                            onOpenChat={handleOpenChat}
                                            onAddTask={l => setTaskLead(l)}
                                            onMarkWon={handleMarkWon}
                                            onMarkLost={handleMarkLost}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* ── List view ── */
                            <div className="rounded-2xl border border-slate-800/60 overflow-hidden" style={{ background: '#0D1117' }}>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-800">
                                            {['Lead', 'Property', 'Source', 'Status', 'Score', 'Priority', 'Days', 'Actions'].map(h => (
                                                <th key={h} className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {filtered.map(lead => {
                                            const stage = STAGES.find(s => s.id === lead.status);
                                            const pc = PRIORITY_CONFIG[lead.priority ?? 'low'];
                                            const days = daysAgo(lead.updated_at ?? lead.created_at);
                                            return (
                                                <tr key={lead.id} className="hover:bg-slate-800/20 transition-colors group">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black border border-slate-700/50"
                                                                style={{ background: `${stage?.accent ?? '#3B82F6'}15`, color: stage?.accent ?? '#3B82F6' }}
                                                            >
                                                                {initials(lead.first_name, lead.last_name)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{lead.first_name} {lead.last_name}</p>
                                                                <p className="text-xs text-slate-500">{lead.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="text-xs text-slate-400 truncate max-w-[140px]">{lead.property_title ?? '—'}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg">
                                                            {lead.source}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="w-1.5 h-1.5 rounded-full"
                                                                style={{ background: stage?.accent, boxShadow: `0 0 6px ${stage?.accent}80` }}
                                                            />
                                                            <span className="text-xs font-bold text-slate-300">{stage?.label ?? lead.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5 text-amber-400">
                                                            <Star size={12} fill="currentColor" />
                                                            <span className="text-sm font-black text-white">{lead.score ?? 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: pc.dot }} />
                                                            <span className={`text-xs font-bold ${pc.color}`}>{pc.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="text-xs text-slate-500">{days === 0 ? 'Today' : `${days}d`}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleOpenChat(lead)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all" title="Chat">
                                                                <MessageCircle size={14} />
                                                            </button>
                                                            <button onClick={() => setTaskLead(lead)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all" title="Add task">
                                                                <Calendar size={14} />
                                                            </button>
                                                            <button onClick={() => handleMarkWon(lead.id)} className="p-1.5 hover:bg-emerald-600/20 rounded-lg text-slate-400 hover:text-emerald-400 transition-all" title="Mark won">
                                                                <Trophy size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filtered.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-5 py-16 text-center">
                                                    <Users size={32} className="text-slate-700 mx-auto mb-3" />
                                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No leads found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Right sidebar ── */}
                    <div className="w-[320px] flex-shrink-0 space-y-5 hidden xl:block">

                        {/* Pipeline overview */}
                        <div className="rounded-2xl border border-slate-800/60 p-5 space-y-4" style={{ background: '#0D1117' }}>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pipeline</h4>
                            <div className="space-y-2.5">
                                {STAGES.filter(s => !['closed_won', 'closed_lost'].includes(s.id)).map(stage => {
                                    const count = leads.filter(l => l.status === stage.id).length;
                                    const pct = leads.length ? Math.round((count / leads.length) * 100) : 0;
                                    return (
                                        <div key={stage.id} className="space-y-1">
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className="font-bold text-slate-400">{stage.label}</span>
                                                <span className="font-black text-white">{count}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, background: stage.accent }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tasks */}
                        <div className="rounded-2xl border border-slate-800/60 p-5 space-y-4" style={{ background: '#0D1117' }}>
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tasks</h4>
                                <span className="text-[10px] font-black text-slate-600">{tasks.filter(t => !t.is_completed).length} pending</span>
                            </div>
                            <div className="space-y-2">
                                {tasks.filter(t => !t.is_completed).slice(0, 5).map(task => (
                                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-all">
                                        <button className="mt-0.5 w-4 h-4 rounded border border-slate-700 flex-shrink-0 hover:bg-blue-600 hover:border-blue-600 transition-all" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{task.title}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                <Clock size={9} />
                                                {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {tasks.filter(t => !t.is_completed).length === 0 && (
                                    <p className="text-center text-xs text-slate-700 py-6 font-bold uppercase tracking-widest">All clear</p>
                                )}
                            </div>
                        </div>

                        {/* Hot leads alert */}
                        {leads.filter(l => (l.score ?? 0) >= 50 && !['closed_won', 'closed_lost'].includes(l.status)).length > 0 && (
                            <div
                                className="rounded-2xl p-5 space-y-3 relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg,#1D4ED8,#6366F1)' }}
                            >
                                <div className="absolute -top-6 -right-6 opacity-10">
                                    <Flame size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Flame size={16} className="text-amber-300" fill="currentColor" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Hot leads</span>
                                    </div>
                                    <p className="text-2xl font-black text-white">
                                        {leads.filter(l => (l.score ?? 0) >= 50 && !['closed_won', 'closed_lost'].includes(l.status)).length}
                                        <span className="text-sm font-medium text-blue-200 ml-2">need attention</span>
                                    </p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-4 w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all"
                                    >
                                        View all hot leads
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Task Modal */}
            <AddTaskModal
                lead={taskLead}
                onClose={() => setTaskLead(null)}
                onSave={handleAddTask}
            />
        </div>
    );
}