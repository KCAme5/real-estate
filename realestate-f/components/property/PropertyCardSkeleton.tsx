'use client';

import { Skeleton } from "@/components/ui/skeleton";

interface PropertyCardSkeletonProps {
    viewMode?: 'grid' | 'list';
}

export default function PropertyCardSkeleton({ viewMode = 'grid' }: PropertyCardSkeletonProps) {
    if (viewMode === 'list') {
        return (
            <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-lg flex flex-col md:flex-row h-full md:h-64 lg:h-72 border border-slate-800">
                {/* Left Side - Image Skeleton */}
                <div className="relative w-full md:w-2/5 h-48 md:h-full overflow-hidden">
                    <Skeleton className="w-full h-full rounded-none" />
                </div>

                {/* Right Side - Content Skeleton */}
                <div className="relative p-6 flex flex-col justify-between w-full md:w-3/5 bg-slate-900">
                    <div className="space-y-4 pr-10">
                        <div>
                            <Skeleton className="h-8 w-3/4 mb-2" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>

                        <Skeleton className="h-8 w-1/3" />

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                        <div className="ml-auto">
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-lg aspect-3/4 sm:aspect-2/3 border border-slate-800">
            {/* Image Background Skeleton */}
            <Skeleton className="absolute inset-0 rounded-none" />

            {/* Overlay Gradient Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            {/* Badges Skeleton */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <Skeleton className="h-6 w-20 rounded-full bg-slate-800/50" />
            </div>

            {/* Content Section Skeleton */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-6 flex flex-col space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-3/4 bg-slate-800/50" />
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-4 w-4 rounded-full bg-slate-800/50" />
                        <Skeleton className="h-4 w-1/2 bg-slate-800/50" />
                    </div>
                </div>

                <Skeleton className="h-8 w-1/3 bg-slate-800/50" />

                <div className="flex items-center gap-4 pt-4 border-t border-slate-800/50">
                    <Skeleton className="h-5 w-10 bg-slate-800/50" />
                    <Skeleton className="h-5 w-10 bg-slate-800/50" />
                    <Skeleton className="h-5 w-10 bg-slate-800/50" />
                </div>
            </div>
        </div>
    );
}
