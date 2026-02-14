'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function AgentCardSkeleton() {
    return (
        <div className="card bg-base-100 shadow-md border border-base-300 p-6">
            <div className="flex items-center gap-6">
                {/* Avatar Skeleton */}
                <div className="flex-shrink-0">
                    <Skeleton className="w-20 h-20 rounded-full" />
                </div>

                {/* Name and Info Skeleton */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                </div>

                {/* Stats Skeletons */}
                <div className="hidden md:flex gap-8 flex-shrink-0">
                    <div className="text-center">
                        <Skeleton className="h-8 w-12 mb-1 mx-auto" />
                        <Skeleton className="h-3 w-8 mx-auto" />
                    </div>
                    <div className="text-center border-l border-r border-base-200 px-6">
                        <Skeleton className="h-8 w-12 mb-1 mx-auto" />
                        <Skeleton className="h-3 w-10 mx-auto" />
                    </div>
                    <div className="text-center">
                        <Skeleton className="h-8 w-12 mb-1 mx-auto" />
                        <Skeleton className="h-3 w-10 mx-auto" />
                    </div>
                </div>

                {/* Mobile view arrow placeholder */}
                <div className="md:hidden flex-shrink-0">
                    <Skeleton className="h-6 w-6 rounded-md" />
                </div>
            </div>
        </div>
    );
}
