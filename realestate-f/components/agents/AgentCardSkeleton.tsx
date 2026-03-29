'use client';

import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = 'grid' | 'list';

interface AgentCardSkeletonProps {
    viewMode?: ViewMode;
}

export default function AgentCardSkeleton({ viewMode = 'grid' }: AgentCardSkeletonProps) {
    if (viewMode === 'list') {
        return (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Avatar */}
                    <div className="shrink-0">
                        <Skeleton className="w-20 h-20 rounded-2xl" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <Skeleton className="h-6 w-28 rounded-lg" />
                            <Skeleton className="h-6 w-20 rounded-lg" />
                            <Skeleton className="h-6 w-24 rounded-lg" />
                        </div>
                        <Skeleton className="h-4 w-full max-w-xl" />
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-6 shrink-0">
                        <div className="hidden lg:flex items-center gap-6">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <Skeleton className="w-12 h-12 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    // Grid view
    return (
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="flex-1">
                    <Skeleton className="h-6 w-36 mb-2" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mb-5">
                <Skeleton className="h-7 w-24 rounded-lg" />
                <Skeleton className="h-7 w-28 rounded-lg" />
            </div>

            {/* Bio */}
            <div className="space-y-2 mb-5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Contact */}
            <div className="space-y-2 mb-5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
        </div>
    );
}