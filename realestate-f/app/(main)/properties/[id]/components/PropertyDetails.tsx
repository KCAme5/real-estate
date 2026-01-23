import {
    Home,
    MapPin,
    Bed,
    Bath,
    Square,
    Star,
    Shield,
    Eye,
    MessageCircle,
    Download,
    Printer,
    Check,
    Wifi,
    Car,
    TreePine,
    Dumbbell,
    Snowflake,
    Waves,
    Utensils,
    Calendar,
    ArrowRight,
    Maximize
} from 'lucide-react';

interface PropertyDetailsProps {
    property: any;
    onContact: () => void;
}

export default function PropertyDetails({ property, onContact }: PropertyDetailsProps) {
    const getFeatureIcon = (feature: string) => {
        const featureIcons: { [key: string]: any } = {
            'wifi': Wifi,
            'parking': Car,
            'garden': TreePine,
            'gym': Dumbbell,
            'air conditioning': Snowflake,
            'swimming pool': Waves,
            'restaurant': Utensils,
            'security': Shield,
            'furnished': Home,
        };

        for (const [key, icon] of Object.entries(featureIcons)) {
            if (feature.toLowerCase().includes(key)) {
                return icon;
            }
        }
        return Check;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: property?.currency || 'KES',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="space-y-12">
            {/* Property Hero Info */}
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    {property.is_featured && (
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 border border-primary/20">
                            <Star size={12} fill="currentColor" />
                            Premium Listing
                        </span>
                    )}
                    {property.is_verified && (
                        <span className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 border border-secondary/20">
                            <Shield size={12} fill="currentColor" />
                            Verified Agent
                        </span>
                    )}
                    <span className="bg-background/80 backdrop-blur-md text-foreground/70 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-border shadow-sm">
                        {property.property_type?.replace('_', ' ')}
                    </span>
                    <span className="bg-background/80 backdrop-blur-md text-foreground/70 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-border shadow-sm flex items-center gap-1.5">
                        <Eye size={12} />
                        {property.views} Views
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                            {property.title}
                        </h1>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin size={20} className="text-secondary" />
                                <span className="text-lg md:text-xl font-bold">{property.address || `${property.location.name}, ${property.location.county}`}</span>
                            </div>
                            <p className="text-muted-foreground/60 font-medium px-7 flex items-center gap-2">
                                {property.location.name}, {property.location.county}
                                <ArrowRight size={14} />
                                <span className="text-primary font-bold uppercase text-[10px] tracking-widest">See on map</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 md:p-8 rounded-[2.5rem] flex flex-col items-start lg:items-end space-y-1 shadow-lg">
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Current Price</span>
                        <div className="text-3xl md:text-5xl font-black text-primary tracking-tighter">
                            {property.price_display || formatPrice(property.price)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Bedrooms', value: property.bedrooms || 0, icon: Bed, color: 'primary' },
                    { label: 'Bathrooms', value: property.bathrooms || 0, icon: Bath, color: 'secondary' },
                    { label: 'Square Ft', value: property.square_feet?.toLocaleString() || 'N/A', icon: Maximize, color: 'accent' },
                    { label: 'Property Type', value: property.property_type, icon: Home, color: 'muted-foreground' },
                ].map((stat, i) => (
                    <div key={i} className="group bg-card border border-border/50 p-6 md:p-8 rounded-[2.5rem] hover:bg-muted/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'muted-foreground' ? 'muted' : stat.color + '/10'} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} className={stat.color === 'muted-foreground' ? 'text-foreground' : `text-${stat.color}`} />
                        </div>
                        <div className="text-xl md:text-2xl font-black text-foreground tracking-tight">{stat.value}</div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Description Section */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-[3rem] p-8 md:p-12 space-y-8">
                <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Experience This Property</h2>
                    <div className="h-1 w-20 bg-primary rounded-full" />
                </div>
                <div className="prose prose-lg max-w-none text-foreground/80">
                    <p className="whitespace-pre-line leading-relaxed font-medium">
                        {property.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                    <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2">
                        <Download size={16} />
                        Download Brochure
                    </button>
                    <button className="px-6 py-3 bg-background border border-border text-foreground rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-muted transition-colors flex items-center gap-2">
                        <Printer size={16} />
                        Print Details
                    </button>
                </div>
            </div>

            {/* Amenities Section */}
            {property.features && property.features.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Luxury Amenities</h2>
                        <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-black">
                            {property.features.length} Features
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {property.features.map((feature: string, index: number) => {
                            const FeatureIcon = getFeatureIcon(feature);
                            return (
                                <div key={index} className="group flex items-center gap-4 p-5 md:p-6 bg-card border border-border/50 rounded-[2rem] hover:bg-primary/5 hover:border-primary/20 transition-all duration-300">
                                    <div className="p-3 bg-muted group-hover:bg-primary/10 rounded-xl transition-colors">
                                        <FeatureIcon size={20} className="text-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="text-sm font-bold text-foreground capitalize tracking-tight">{feature}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Facts & Figures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-card border border-border/50 rounded-[3rem] p-8 md:p-10 space-y-8">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-widest border-b border-border pb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Internal Specs
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Property ID', value: `#${property.id}` },
                            { label: 'Year Built', value: property.year_built || '2024 (Modern)' },
                            { label: 'Interior Style', value: property.interior_style || 'Contemporary' },
                            { label: 'Furniture', value: property.is_furnished ? 'Fully Furnished' : 'Unfurnished' },
                        ].map((fact, i) => (
                            <div key={i} className="flex justify-between items-center group">
                                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{fact.label}</span>
                                <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{fact.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-border/50 rounded-[3rem] p-8 md:p-10 space-y-8">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-widest border-b border-border pb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        Sale Overview
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Current Status', value: property.status, color: 'text-primary' },
                            { label: 'Listing Date', value: property.created_at ? new Date(property.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A' },
                            { label: 'Price Neg.', value: property.is_negotiable ? 'Flexible' : 'Fixed Price' },
                            { label: 'Ownership', value: property.ownership_type || 'Freehold' },
                        ].map((fact, i) => (
                            <div key={i} className="flex justify-between items-center group">
                                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{fact.label}</span>
                                <span className={`text-sm font-black ${fact.color || 'text-foreground'} group-hover:text-secondary transition-colors`}>{fact.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Location & Map UI */}
            <div className="bg-card border border-border/50 rounded-[3rem] p-8 md:p-12 space-y-10 overflow-hidden relative">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight whitespace-nowrap">Location Excellence</h2>
                            <div className="h-1 w-20 bg-secondary rounded-full" />
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-secondary/10 rounded-2xl">
                                <MapPin size={24} className="text-secondary" />
                            </div>
                            <div>
                                <p className="text-foreground font-black text-xl md:text-2xl tracking-tight leading-none mb-2">
                                    {property.address || property.location.name}
                                </p>
                                <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">
                                    {property.location.name}, {property.location.county}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button className="px-8 py-4 bg-foreground text-background rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl flex items-center gap-2">
                        Open in Google Maps
                        <ArrowRight size={16} />
                    </button>
                </div>

                {/* Map Mockup */}
                <div className="relative w-full h-80 rounded-[2.5rem] overflow-hidden border border-border group">
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                                <MapPin className="text-primary" size={32} />
                            </div>
                            <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Interactive HD Map Initializing...</p>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
