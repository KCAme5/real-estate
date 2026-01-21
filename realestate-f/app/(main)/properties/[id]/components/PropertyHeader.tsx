import { ArrowLeft, Share2, Heart, CheckCircle, Copy, Facebook, Twitter, Linkedin, Star, MapPin } from 'lucide-react';

interface PropertyHeaderProps {
    property: any;
    isSaved: boolean;
    saving: boolean;
    authLoading: boolean;
    onSave: () => void;
    onShare: (platform?: string) => void;
    copied: boolean;
    router: any;
}

export default function PropertyHeader({
    property,
    isSaved,
    saving,
    authLoading,
    onSave,
    onShare,
    copied,
    router
}: PropertyHeaderProps) {
    return (
        <div className="sticky top-0 z-[60] bg-background/60 backdrop-blur-2xl border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Back & Title */}
                    <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                        <button
                            onClick={() => router.back()}
                            className="p-2.5 md:p-3 bg-muted/50 hover:bg-primary hover:text-primary-foreground rounded-2xl transition-all duration-300 shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="hidden sm:flex flex-col overflow-hidden">
                            <h1 className="text-sm md:text-lg font-black text-foreground line-clamp-1 tracking-tight">
                                {property.title}
                            </h1>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin size={12} className="text-secondary" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">
                                    {property.location.name}, {property.location.county}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Share Dropdown */}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="p-2.5 md:p-3 bg-muted/50 hover:bg-background rounded-2xl transition-all shadow-sm">
                                <Share2 size={20} className="text-foreground" />
                            </div>
                            <div tabIndex={0} className="dropdown-content z-50 mt-4 p-4 shadow-2xl bg-card border border-border rounded-[2rem] w-72 backdrop-blur-xl">
                                <div className="p-2 mb-4 border-b border-border/50">
                                    <h3 className="font-black text-foreground uppercase tracking-widest text-xs">Share Property</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => onShare('copy')}
                                        className="flex items-center justify-between p-3 bg-muted/50 hover:bg-primary hover:text-primary-foreground rounded-xl transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {copied ? <CheckCircle size={18} className="text-success group-hover:text-white" /> : <Copy size={18} />}
                                            <span className="font-bold text-sm tracking-tight">{copied ? 'Link Copied!' : 'Copy Link'}</span>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 italic">URL</div>
                                    </button>

                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {[
                                            { name: 'facebook', icon: Facebook, color: 'text-blue-600', label: 'FB' },
                                            { name: 'twitter', icon: Twitter, color: 'text-sky-400', label: 'TW' },
                                            { name: 'linkedin', icon: Linkedin, color: 'text-blue-700', label: 'IN' },
                                        ].map((social) => (
                                            <button
                                                key={social.name}
                                                onClick={() => onShare(social.name)}
                                                className="flex flex-col items-center justify-center p-3 bg-muted/30 hover:bg-background rounded-xl border border-transparent hover:border-border transition-all"
                                            >
                                                <social.icon size={20} className={social.color} />
                                                <span className="text-[8px] font-black mt-1 uppercase tracking-widest text-muted-foreground">{social.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={onSave}
                            disabled={saving || authLoading}
                            className={`flex items-center gap-2.5 px-5 md:px-7 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-lg ${isSaved
                                    ? 'bg-primary text-primary-foreground shadow-primary/25'
                                    : 'bg-background border border-border text-foreground hover:bg-muted shadow-sm'
                                }`}
                        >
                            <Heart
                                size={18}
                                className={`${isSaved ? "fill-current" : ""} ${saving ? 'animate-pulse' : ''}`}
                            />
                            <span className="hidden md:inline">{saving ? 'Processing...' : isSaved ? 'Saved to Favorites' : 'Save Property'}</span>
                            <span className="md:hidden">{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
