'use client';

import React, { Suspense } from 'react';
import MessagesContent from '../../messages/MessagesContent';

type AgentMessagesErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

class AgentMessagesErrorBoundary extends React.Component<{ children: React.ReactNode }, AgentMessagesErrorBoundaryState> {
    state: AgentMessagesErrorBoundaryState = {
        hasError: false,
        error: null,
    };

    static getDerivedStateFromError(error: Error): AgentMessagesErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('AgentMessagesErrorBoundary caught an error', { error, info });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen items-center justify-center bg-[#0B192F] text-white px-4">
                    <div className="max-w-md text-center space-y-4">
                        <h1 className="text-2xl font-semibold">Something went wrong with agent messages</h1>
                        <p className="text-sm text-gray-300">
                            Please try refreshing the page. If the problem persists, contact support.
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function AgentMessagesPage() {
    return (
        <AgentMessagesErrorBoundary>
            <Suspense
                fallback={
                    <div className="flex h-screen items-center justify-center bg-[#0B192F]">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                }
            >
                <MessagesContent />
            </Suspense>
        </AgentMessagesErrorBoundary>
    );
}
