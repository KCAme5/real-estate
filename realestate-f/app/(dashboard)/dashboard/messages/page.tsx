import { Suspense } from 'react';
import MessagesContent from './MessagesContent';

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#0B192F]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}
