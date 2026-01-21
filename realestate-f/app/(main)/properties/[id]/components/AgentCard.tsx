import Link from 'next/link';
import {
    Phone,
    Mail,
    Calendar,
    MessageCircle,
    Heart,
    Star,
    Shield,
    Check,
    ArrowRight,
    Award,
    TrendingUp
} from 'lucide-react';

interface AgentCardProps {
    property: any;
    onContact: () => void;
    onSave: () => void;
    isSaved: boolean;
    saving: boolean;
    isAuthenticated: boolean;
}

export default function AgentCard({
    property,
    onContact,
    onSave,
    isSaved,
    saving,
    isAuthenticated
}: AgentCardProps) {
    const handleCallAgent = () => {
        if (!agent?.user_phone) return;
        window.open(`tel:${agent.user_phone}`, '_self');
    };

    const handleEmailAgent = () => {
        if (!agent?.user_email) return;
        const subject = `Inquiry about ${property.title}`;
        const body = `Hello ${agent.user_name},\n\nI am interested in the property: ${property.title}\n\nProperty Details:\n- Price: ${property.price_display}\n- Location: ${property.location.name}, ${property.location.county}\n- Type: ${property.property_type}\n\nPlease contact me with more information.\n\nBest regards,`;
        window.open(`mailto:${agent.user_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    };

    const handleScheduleViewing = () => {
        onContact();
    };

    const agent = property.agent;

    if (!agent) return null;

    return (
        <div className="space-y-6 sticky top-28">
            {/* Agent Profile Card */}
            <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                <div className="relative z-10 space-y-8">
                    {/* Header */}
                    <Link href={`/agents/${agent.slug}`} className="group/agent block">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-lg overflow-hidden">
                                    {agent.user_avatar ? (
                                        <img
                                            src={agent.user_avatar}
                                            alt={agent.user_name}
                                            className="w-full h-full object-cover transition-transform group-hover/agent:scale-110"
                                        />
                                    ) : (
                                        `${agent.user_name?.[0] || 'A'}`
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center shadow-lg">
                                    <Shield size={14} className="text-primary fill-current" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-none group-hover/agent:text-primary transition-colors">
                                    {agent.user_name || 'Professional Agent'}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-0.5 rounded-md">Premier Agent</span>
                                    <div className="flex items-center gap-1">
                                        <Star size={12} className="text-warning fill-current" />
                                        <span className="text-xs font-black text-foreground">{agent.average_rating || 4.9}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Award size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Experience</span>
                            </div>
                            <div className="text-lg font-black text-foreground">{agent.years_of_experience ? `${agent.years_of_experience} Years` : '5+ Years'}</div>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <TrendingUp size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Listings</span>
                            </div>
                            <div className="text-lg font-black text-foreground">{agent.total_listings || '24'}+</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleCallAgent}
                            className="w-full flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Phone size={18} />
                                Call Agent
                            </div>
                            <ArrowRight size={16} className="opacity-50" />
                        </button>

                        <button
                            onClick={handleScheduleViewing}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-secondary text-secondary-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-md"
                        >
                            <Calendar size={18} />
                            Book a Viewing
                        </button>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={handleEmailAgent}
                                className="flex items-center justify-center gap-2 p-4 bg-background border border-border text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
                            >
                                <Mail size={16} />
                                Email
                            </button>
                            <button
                                onClick={onContact}
                                className="flex items-center justify-center gap-2 p-4 bg-background border border-border text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
                            >
                                <MessageCircle size={16} />
                                Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Card */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-[2.5rem] p-6 text-center space-y-4 shadow-sm">
                <p className="text-xs font-bold text-muted-foreground tracking-tight">Interested in this property but not ready yet?</p>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${isSaved
                        ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20'
                        : 'bg-foreground text-background hover:bg-primary hover:text-white'
                        }`}
                >
                    <Heart size={18} className={isSaved ? 'fill-current' : ''} />
                    {saving ? 'Processing...' : isSaved ? 'Remove Favorite' : 'Save for Later'}
                </button>
            </div>

            {/* Safety Tips Overlay */}
            <div className="bg-muted/50 border border-border/50 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                        <Shield className="text-success" size={20} />
                    </div>
                    <h4 className="font-black text-foreground tracking-tight">Safety Protocol</h4>
                </div>
                <ul className="space-y-4">
                    {[
                        'Verify property details with agent',
                        'Visit during daylight hours',
                        'Never wire funds upfront',
                        'Review official documentation'
                    ].map((tip, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-success" />
                            <span className="text-xs font-bold text-muted-foreground">{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
