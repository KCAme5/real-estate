'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface FeaturedDevelopment {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: string;
  price_display: string;
  currency: string;
  location: {
    name: string;
    county: string;
  };
  main_image_url: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
}

const DISMISS_KEY = 'featured_development_dismissed';
const DISMISS_DURATION_DAYS = 7;

export default function FeaturedProjectBanner() {
  const [project, setProject] = useState<FeaturedDevelopment | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedDevelopment = async () => {
      // Check if user has dismissed recently
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - dismissedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < DISMISS_DURATION_DAYS) {
          setLoading(false);
          return;
        }
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/properties/featured-development/`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setProject(data);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Error fetching featured development:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDevelopment();
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setIsVisible(false);
  };

  if (loading || !isVisible || !project) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      
      {/* Banner */}
      <div className="relative w-full max-w-4xl mx-auto overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-2/5 h-48 md:h-auto min-h-[200px]">
            {project.main_image_url ? (
              <Image
                src={project.main_image_url}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-emerald-800 flex items-center justify-center">
                <Building2 className="w-24 h-24 text-emerald-600/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/80 md:bg-gradient-to-t md:from-slate-900/80 md:to-transparent" />
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium w-fit mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Featured Development
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {project.title}
            </h2>

            <p className="text-slate-300 mb-4 line-clamp-2">
              {project.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
              {project.location && (
                <span>{project.location.name}, {project.location.county}</span>
              )}
              {project.bedrooms && (
                <span>{project.bedrooms} Bed</span>
              )}
              {project.bathrooms && (
                <span>{project.bathrooms} Bath</span>
              )}
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div>
                <p className="text-slate-400 text-sm">Starting from</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {project.price_display || `${project.currency} ${parseInt(project.price).toLocaleString()}`}
                </p>
              </div>

              <Link
                href={`/properties/${project.slug}`}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}