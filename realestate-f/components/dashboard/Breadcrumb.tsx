'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    return (
        <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-medium"
            >
                <Home size={14} />
                <span>Dashboard</span>
            </Link>

            {paths.slice(1).map((path, index) => {
                const href = `/${paths.slice(0, index + 2).join('/')}`;
                const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

                return (
                    <React.Fragment key={href}>
                        <ChevronRight size={14} className="text-muted-foreground/50 shrink-0" />
                        <Link
                            href={href}
                            className={`font-medium transition-colors ${index === paths.length - 2
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-primary'
                                }`}
                        >
                            {label}
                        </Link>
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
