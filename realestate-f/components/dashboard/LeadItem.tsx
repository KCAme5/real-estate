'use client';

import React from 'react';
import { MessageSquare, Plus, Search, Phone } from 'lucide-react';

interface LeadItemProps {
    id: number;
    name: string;
    location: string;
    budget: string;
    bedrooms: string;
    contact: string;
    type: 'phone' | 'email';
}

export function LeadItem({ id, name, location, budget, bedrooms, contact, type }: LeadItemProps) {
    return (
        <div className="p-5 bg-muted/10 border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{name}</h4>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                        {location}
                    </p>
                </div>
                <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                    Hot Lead
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interest</p>
                    <p className="text-sm font-semibold text-foreground">{bedrooms}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-semibold text-primary">{budget}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6 p-2 bg-background/50 rounded-lg border border-border/30">
                <div className={`p-2 rounded-md ${type === 'phone' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'}`}>
                    {type === 'phone' ? <Phone size={14} /> : <MessageSquare size={14} />}
                </div>
                <p className="text-sm font-bold text-foreground">{contact}</p>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Follow Up</button>
                <button className="flex-1 px-3 py-2 text-xs font-bold bg-background border border-border hover:bg-muted/30 rounded-lg transition-colors">Schedule</button>
                <button className="px-3 py-2 text-xs font-bold bg-background border border-border hover:bg-muted/30 rounded-lg transition-colors">
                    {type === 'phone' ? <Phone size={14} /> : <MessageSquare size={14} />}
                </button>
            </div>
        </div>
    );
}

interface RecentLeadsProps {
    leads?: LeadItemProps[];
}

export function RecentLeads({ leads: leadData }: { leads?: any[] }) {
    const defaultLeads = [
        {
            id: 1,
            name: 'John M.',
            location: 'Kilimani',
            budget: 'Kes 40M',
            bedrooms: '3BD apartment',
            contact: '0712 XXX XXX',
            type: 'phone',
        } as const,
        {
            id: 2,
            name: 'Mary W.',
            location: 'Westlands',
            budget: 'Kes 60M',
            bedrooms: '4BD family home',
            contact: 'mary@email.com',
            type: 'email',
        } as const,
    ];

    const displayLeads = leadData && leadData.length > 0 ? leadData : defaultLeads;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayLeads.map((lead: any) => (
                <LeadItem
                    key={lead.id}
                    id={lead.id}
                    name={lead.full_name || lead.name || 'Anonymous'}
                    location={lead.preferred_location || lead.location || 'Not Specified'}
                    budget={typeof lead.budget === 'number' ? `Kes ${lead.budget.toLocaleString()}` : (lead.budget || 'Open')}
                    bedrooms={lead.property_type || lead.bedrooms || 'Interest in Property'}
                    contact={lead.email || lead.phone || lead.contact}
                    type={lead.phone ? 'phone' : 'email'}
                />
            ))}
        </div>
    );
}
