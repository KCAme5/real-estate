'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { leadsAPI, CreateLeadData } from '@/lib/api/leads';
import { propertyAPI } from '@/lib/api/properties';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { useToast } from '@/components/ui/toast';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Home,
    DollarSign, Tag, MessageSquare, CheckCircle2,
    ChevronRight, Loader2, Plus, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface FormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    source: CreateLeadData['source'];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    budget_min: string;
    budget_max: string;
    preferred_locations: string[];
    property_types: string[];
    property: number | undefined;
    notes: string;
}

const INITIAL: FormData = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: 'website',
    priority: 'medium',
    budget_min: '',
    budget_max: '',
    preferred_locations: [],
    property_types: [],
    property: undefined,
    notes: '',
};

// ─── Config ───────────────────────────────────────────────────────────────────

const SOURCE_OPTIONS: { value: CreateLeadData['source']; label: string }[] = [
    { value: 'website', label: 'Website' },
    { value: 'contact_form', label: 'Contact Form' },
    { value: 'book_viewing', label: 'Book Viewing' },
    { value: 'saved_property', label: 'Saved Property' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'referral', label: 'Referral' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'phone', label: 'Phone Call' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: '#64748B' },
    { value: 'medium', label: 'Medium', color: '#3B82F6' },
    { value: 'high', label: 'High', color: '#F97316' },
    { value: 'urgent', label: 'Urgent', color: '#F43F5E' },
] as const;

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Townhouse'];

const KE_LOCATIONS = [
    'Westlands', 'Kilimani', 'Karen', 'Kileleshwa', 'Lavington',
    'Parklands', 'Runda', 'Muthaiga', 'CBD', 'Upperhill',
    'Thika Road', 'Mombasa Road', 'Ngong Road', 'Ruaka',
    'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
];

const STEPS = [
    { id: 1, label: 'Contact', desc: 'Who is this lead?' },
    { id: 2, label: 'Preferences', desc: 'What are they looking for?' },
    { id: 3, label: 'Notes', desc: 'Any extra context?' },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

// ─── Field components ─────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            {children}
        </label>
    );
}

function Input({
    icon: Icon, error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ElementType;
    error?: string;
}) {
    return (
        <div className="relative">
            {Icon && (
                <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            )}
            <input
                {...props}
                className={`
                    w-full bg-[#0D1117] border rounded-xl py-3 text-sm text-white
                    placeholder-slate-600 focus:outline-none transition-colors
                    ${Icon ? 'pl-10 pr-4' : 'px-4'}
                    ${error
                        ? 'border-rose-500/60 focus:border-rose-500'
                        : 'border-slate-800 focus:border-blue-500/60 hover:border-slate-700'
                    }
                `}
            />
            {error && <p className="mt-1.5 text-[10px] text-rose-400 font-bold">{error}</p>}
        </div>
    );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className="w-full bg-[#0D1117] border border-slate-800 hover:border-slate-700 focus:border-blue-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors resize-none"
        />
    );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            {...props}
            className="w-full bg-[#0D1117] border border-slate-800 hover:border-slate-700 focus:border-blue-500/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors appearance-none cursor-pointer"
        >
            {children}
        </select>
    );
}

// ─── Step indicators ──────────────────────────────────────────────────────────

function StepBar({ current }: { current: Step }) {
    return (
        <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
                const done = current > step.id;
                const active = current === step.id;
                return (
                    <div key={step.id} className="flex items-center">
                        <div className="flex items-center gap-2.5">
                            <div
                                className={`
                                    w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black
                                    transition-all duration-300
                                    ${done ? 'bg-blue-600 text-white' : ''}
                                    ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : ''}
                                    ${!done && !active ? 'bg-slate-800 text-slate-600 border border-slate-700' : ''}
                                `}
                            >
                                {done ? <CheckCircle2 size={14} /> : step.id}
                            </div>
                            <div className="hidden sm:block">
                                <p className={`text-xs font-black ${active ? 'text-white' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {step.label}
                                </p>
                                <p className="text-[10px] text-slate-600">{step.desc}</p>
                            </div>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-12 h-px mx-4 transition-all duration-500 ${current > step.id ? 'bg-blue-600' : 'bg-slate-800'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewLeadPage() {
    const router = useRouter();
    const { success, error: showError } = useToast();
    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState<FormData>(INITIAL);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [properties, setProperties] = useState<{ id: number; title: string }[]>([]);
    const [locationInput, setLocationInput] = useState('');

    useEffect(() => {
        // Load properties for the property selector
        propertyAPI.getAll({ limit: 100 })
            .then((res: any) => setProperties(Array.isArray(res) ? res : []))
            .catch(() => { });
    }, []);

    const set = (key: keyof FormData, value: any) => {
        setForm(p => ({ ...p, [key]: value }));
        setErrors(p => ({ ...p, [key]: undefined }));
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const validateStep = (s: Step): boolean => {
        const errs: typeof errors = {};
        if (s === 1) {
            // First name and last name are now optional
            // Phone is now optional
            if (!form.email.trim()) errs.email = 'Required';
            else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        }
        if (s === 2) {
            if (form.budget_min && form.budget_max) {
                if (Number(form.budget_min) > Number(form.budget_max)) {
                    errs.budget_min = 'Min cannot exceed max';
                }
            }
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const next = () => {
        if (!validateStep(step)) return;
        setStep(s => Math.min(3, s + 1) as Step);
    };

    const back = () => setStep(s => Math.max(1, s - 1) as Step);

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!validateStep(3)) return;
        setSubmitting(true);
        try {
            const payload: CreateLeadData = {
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                source: form.source,
                priority: form.priority,
                budget_min: form.budget_min ? Number(form.budget_min) : undefined,
                budget_max: form.budget_max ? Number(form.budget_max) : undefined,
                preferred_locations: form.preferred_locations,
                property_types: form.property_types,
                property: form.property,
                notes: form.notes.trim(),
            };
            const lead = await leadsAPI.createLead(payload);
            const name = `${form.first_name} ${form.last_name}`.trim() || 'Lead';
            success('Lead created', `${name} added to pipeline`);
            router.push(`/dashboard/agent/leads`);
        } catch (e: any) {
            showError('Failed to create lead', e?.message ?? 'Please try again');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Location tag input ────────────────────────────────────────────────────

    const addLocation = (loc: string) => {
        const trimmed = loc.trim();
        if (trimmed && !form.preferred_locations.includes(trimmed)) {
            set('preferred_locations', [...form.preferred_locations, trimmed]);
        }
        setLocationInput('');
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-xl border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 transition-all"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <Breadcrumb />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">New Lead</h1>
                        <p className="text-slate-500 text-sm mt-1">Add a lead manually to your pipeline</p>
                    </div>
                    <StepBar current={step} />
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl border border-slate-800/60 p-6 md:p-8 space-y-6"
                    style={{ background: '#0D1117' }}
                >

                    {/* ── Step 1: Contact info ── */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>First name (Optional)</Label>
                                    <Input
                                        icon={User}
                                        placeholder="John"
                                        value={form.first_name}
                                        onChange={e => set('first_name', e.target.value)}
                                        error={errors.first_name}
                                    />
                                </div>
                                <div>
                                    <Label>Last name (Optional)</Label>
                                    <Input
                                        placeholder="Doe"
                                        value={form.last_name}
                                        onChange={e => set('last_name', e.target.value)}
                                        error={errors.last_name}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Email</Label>
                                <Input
                                    icon={Mail}
                                    type="email"
                                    placeholder="john@example.com"
                                    value={form.email}
                                    onChange={e => set('email', e.target.value)}
                                    error={errors.email}
                                />
                            </div>

                            <div>
                                <Label>Phone (Optional)</Label>
                                <Input
                                    icon={Phone}
                                    type="tel"
                                    placeholder="+254 700 000 000"
                                    value={form.phone}
                                    onChange={e => set('phone', e.target.value)}
                                    error={errors.phone}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Source</Label>
                                    <Select
                                        value={form.source}
                                        onChange={e => set('source', e.target.value)}
                                    >
                                        {SOURCE_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <Label>Priority</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PRIORITY_OPTIONS.map(p => (
                                            <button
                                                key={p.value}
                                                type="button"
                                                onClick={() => set('priority', p.value)}
                                                className={`
                                                    py-2.5 rounded-xl text-xs font-black border transition-all
                                                    ${form.priority === p.value
                                                        ? 'text-white border-transparent'
                                                        : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                                    }
                                                `}
                                                style={form.priority === p.value
                                                    ? { background: `${p.color}22`, borderColor: `${p.color}60`, color: p.color }
                                                    : {}
                                                }
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Property preferences ── */}
                    {step === 2 && (
                        <div className="space-y-6">

                            {/* Budget */}
                            <div>
                                <Label>Budget range (KES)</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <DollarSign size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={form.budget_min}
                                            onChange={e => set('budget_min', e.target.value)}
                                            className="w-full bg-[#0D1117] border border-slate-800 hover:border-slate-700 focus:border-blue-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <span className="text-slate-700 text-sm font-bold flex-shrink-0">to</span>
                                    <div className="relative flex-1">
                                        <DollarSign size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={form.budget_max}
                                            onChange={e => set('budget_max', e.target.value)}
                                            className="w-full bg-[#0D1117] border border-slate-800 hover:border-slate-700 focus:border-blue-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                {errors.budget_min && (
                                    <p className="mt-1.5 text-[10px] text-rose-400 font-bold">{errors.budget_min}</p>
                                )}
                            </div>

                            {/* Property types */}
                            <div>
                                <Label>Property types interested in</Label>
                                <div className="flex flex-wrap gap-2">
                                    {PROPERTY_TYPES.map(pt => {
                                        const active = form.property_types.includes(pt);
                                        return (
                                            <button
                                                key={pt}
                                                type="button"
                                                onClick={() => set('property_types', toggle(form.property_types, pt))}
                                                className={`
                                                    px-4 py-2 rounded-xl text-xs font-bold border transition-all
                                                    ${active
                                                        ? 'bg-blue-600/15 border-blue-500/50 text-blue-400'
                                                        : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                                    }
                                                `}
                                            >
                                                {pt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preferred locations */}
                            <div>
                                <Label>Preferred locations</Label>
                                {/* Quick picks */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {KE_LOCATIONS.map(loc => {
                                        const active = form.preferred_locations.includes(loc);
                                        return (
                                            <button
                                                key={loc}
                                                type="button"
                                                onClick={() => set('preferred_locations', toggle(form.preferred_locations, loc))}
                                                className={`
                                                    px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all
                                                    ${active
                                                        ? 'bg-blue-600/15 border-blue-500/50 text-blue-400'
                                                        : 'bg-transparent border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-400'
                                                    }
                                                `}
                                            >
                                                {loc}
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Custom location input */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                        <input
                                            placeholder="Add custom location..."
                                            value={locationInput}
                                            onChange={e => setLocationInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLocation(locationInput); } }}
                                            className="w-full bg-[#0D1117] border border-slate-800 hover:border-slate-700 focus:border-blue-500/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addLocation(locationInput)}
                                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-all"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {/* Selected tags */}
                                {form.preferred_locations.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {form.preferred_locations.map(loc => (
                                            <span
                                                key={loc}
                                                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 border border-blue-500/30 rounded-lg text-xs text-blue-400 font-bold"
                                            >
                                                {loc}
                                                <button
                                                    type="button"
                                                    onClick={() => set('preferred_locations', form.preferred_locations.filter(l => l !== loc))}
                                                    className="text-blue-600 hover:text-blue-300 transition-colors"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Specific property */}
                            <div>
                                <Label>Specific property (optional)</Label>
                                <div className="relative">
                                    <Home size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                    <select
                                        value={form.property ?? ''}
                                        onChange={e => set('property', e.target.value ? Number(e.target.value) : undefined)}
                                        className="w-full bg-[#0D1117] border border-slate-800 hover:border-slate-700 focus:border-blue-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="">No specific property</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Notes + summary ── */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <Label>Notes</Label>
                                <Textarea
                                    rows={5}
                                    placeholder="Any context about this lead — how you met them, what they're looking for, timeline, concerns..."
                                    value={form.notes}
                                    onChange={e => set('notes', e.target.value)}
                                />
                            </div>

                            {/* Summary card */}
                            <div className="rounded-xl border border-slate-800/60 p-5 space-y-3 bg-slate-900/30">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Summary</p>
                                <div className="space-y-2.5">
                                    {[
                                        { label: 'Name', value: `${form.first_name} ${form.last_name}`.trim() },
                                        { label: 'Email', value: form.email },
                                        { label: 'Phone', value: form.phone },
                                        { label: 'Source', value: SOURCE_OPTIONS.find(s => s.value === form.source)?.label },
                                        { label: 'Priority', value: PRIORITY_OPTIONS.find(p => p.value === form.priority)?.label },
                                        { label: 'Budget', value: form.budget_min || form.budget_max ? `KES ${Number(form.budget_min || 0).toLocaleString()} – ${Number(form.budget_max || 0).toLocaleString()}` : '—' },
                                        { label: 'Locations', value: form.preferred_locations.join(', ') || '—' },
                                        { label: 'Types', value: form.property_types.join(', ') || '—' },
                                    ].map(row => (
                                        <div key={row.label} className="flex items-start justify-between gap-4">
                                            <span className="text-[11px] text-slate-600 font-bold flex-shrink-0">{row.label}</span>
                                            <span className="text-[11px] text-slate-300 font-medium text-right">{row.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={step === 1 ? () => router.back() : back}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 text-sm font-bold text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                    >
                        <ArrowLeft size={15} />
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={next}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95 shadow-lg"
                            style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}
                        >
                            Continue
                            <ChevronRight size={15} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
                        >
                            {submitting ? (
                                <><Loader2 size={15} className="animate-spin" /> Creating...</>
                            ) : (
                                <><CheckCircle2 size={15} /> Create Lead</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}