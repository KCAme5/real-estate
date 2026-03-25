'use client';

import Link from 'next/link';
import { Agent } from '@/types/agent';

interface AgentCardProps {
    agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
    const avatarUrl = agent.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.user_name)}&background=random`;

    return (
        <Link href={`/agents/${agent.slug}`} className="block group">
            <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border border-base-300 hover:border-primary/50">
                <div className="card-body p-6">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="avatar flex-shrink-0">
                            <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                                <img
                                    src={avatarUrl}
                                    alt={agent.user_name}
                                    className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        {/* Name and Verified Badge */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xl font-bold text-base-content group-hover:text-primary transition-colors truncate">
                                    {agent.user_name}
                                </h2>
                                {agent.is_verified && (
                                    <div className="badge badge-success gap-1 text-white text-xs flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-3 h-3 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Verified
                                    </div>
                                )}
                            </div>

                            {/* Specialties */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {agent.specialties?.slice(0, 4).map((specialty, index) => (
                                    <span key={index} className="badge badge-ghost badge-sm">
                                        {specialty}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex gap-8 flex-shrink-0">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{agent.total_properties_sold}</div>
                                <div className="text-xs text-base-content/60">Sold</div>
                            </div>
                            <div className="text-center border-l border-r border-base-200 px-6">
                                <div className="text-2xl font-bold text-primary">{agent.active_properties || 0}</div>
                                <div className="text-xs text-base-content/60">Active</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-warning flex items-center justify-center gap-1">
                                    {agent.average_rating}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="text-xs text-base-content/60">Rating</div>
                            </div>
                        </div>

                        {/* Mobile view arrow */}
                        <div className="md:hidden flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-base-content/40 group-hover:text-primary transition-colors">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
