'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AgentPropertyForm from '@/components/agents/AgentPropertyForm';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { Home } from 'lucide-react';

export default function NewPropertyPage() {
    const router = useRouter();
    const { user } = useAuth();

    const handlePropertyCreated = (property: any) => {
        console.log('Property created:', property);
        router.push('/dashboard/agent/properties');
    };

    const handleCancel = () => {
        router.push('/dashboard/agent/properties');
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Breadcrumb />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Home className="text-primary" size={32} />
                            Create New Property Listing
                        </h1>
                        <p className="text-muted-foreground mt-1">Fill in all required details to list your property</p>
                    </div>
                </div>

                <AgentPropertyForm
                    onCreated={handlePropertyCreated}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}