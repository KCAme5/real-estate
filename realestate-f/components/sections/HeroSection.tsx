'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchFilters from '@/components/property/SearchFilters';

const heroImages = [
    {
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920',
        alt: 'Modern Kenyan family home'
    },
    {
        url: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1984&q=80',
        alt: 'African family in beautiful home'
    },
    {
        url: 'https://cdn.home-designing.com/wp-content/uploads/2015/09/cool-home-exterior1-1024x576.jpg',
        alt: 'Luxury villa with pool'
    },
    {
        url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=2065&q=80',
        alt: 'Modern apartment building'
    },
    {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        alt: 'Cozy living room interior'
    }
];

export default function HeroSection() {
    const router = useRouter();
    const [showSearch, setShowSearch] = useState(false);
    const [location, setLocation] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [imageError, setImageError] = useState<number | null>(null);

    // Auto-rotate slides
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    const handleImageError = (index: number) => {
        setImageError(index);
    };

    // Handle simple search
    const handleSimpleSearch = () => {
        const params = new URLSearchParams();
        if (location) params.append('location', location);
        router.push(`/properties?${params.toString()}`);
    };

    // Handle advanced search from modal
    const handleAdvancedSearch = (filters: any) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, String(value));
        });
        setShowSearch(false);
        router.push(`/properties?${params.toString()}`);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Carousel */}
            <div className="absolute inset-0">
                {heroImages.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {imageError === index ? (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <div className="text-center text-foreground">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-lg">Image not available</p>
                                </div>
                            </div>
                        ) : (
                            <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(index)}
                            />
                        )}
                        {/* Dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>
                ))}
            </div>

            <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Trusted by Clients Worldwide</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
                    Discover Your
                    <span className="block text-primary font-bold">
                        Dream Property
                    </span>
                    in Kenya
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                    Premium real estate solutions connecting Kenyans and the diaspora with
                    exceptional properties and investment opportunities across the country.
                </p>
                <p className="text-lg md:text-xl text-slate-200 mb-12 font-medium tracking-wide">
                    Buy • Sell • Rent • Commercial
                </p>

                {/* CTA Buttons */}
                {/* Hero Search Section */}
                <div className="bg-card/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-border/50 max-w-4xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Simple Search - Location */}
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Where do you want to live? (e.g. Nairobi)"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-background border-2 border-border/50 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground placeholder:text-muted-foreground font-medium"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSimpleSearch();
                                    }
                                }}
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSimpleSearch}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 min-w-40"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </button>
                    </div>

                    {/* Advanced Search Link */}
                    <div className="mt-4 flex items-center justify-between px-2">
                        <div className="flex gap-4 text-sm text-foreground/80 font-medium overflow-x-auto no-scrollbar">
                            <span className="whitespace-nowrap flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Buy</span>
                            <span className="whitespace-nowrap flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Rent</span>
                            <span className="whitespace-nowrap flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Invest</span>
                        </div>
                        <button
                            onClick={() => setShowSearch(true)}
                            className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap"
                        >
                            Advanced Filters
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                    {[
                        { number: '500+', label: 'Properties Listed' },
                        { number: 'KSH 15B+', label: 'Property Value' },
                        { number: '98%', label: 'Client Satisfaction' }
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                            <div className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Carousel Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                {/* Previous Button */}
                <button
                    onClick={prevSlide}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Slide Indicators */}
                <div className="flex gap-2">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white w-8'
                                : 'bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={nextSlide}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Search Modal */}
            {showSearch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-gray-950 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-foreground">Find Your Perfect Property</h3>
                                <button
                                    onClick={() => setShowSearch(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <SearchFilters
                                onClose={() => setShowSearch(false)}
                                onSearch={handleAdvancedSearch}
                                initialFilters={{ location }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}