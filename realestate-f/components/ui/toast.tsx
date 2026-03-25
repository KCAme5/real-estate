'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast: Toast = { id, type, title, message, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const success = useCallback((title: string, message?: string) => {
        return addToast('success', title, message);
    }, [addToast]);

    const error = useCallback((title: string, message?: string) => {
        return addToast('error', title, message, 8000); // Errors stay longer
    }, [addToast]);

    const info = useCallback((title: string, message?: string) => {
        return addToast('info', title, message);
    }, [addToast]);

    const warning = useCallback((title: string, message?: string) => {
        return addToast('warning', title, message, 6000);
    }, [addToast]);

    return (
        <ToastContext.Provider value={{
            toasts,
            addToast,
            removeToast,
            success,
            error,
            info,
            warning
        }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'border-green-200 bg-green-50';
            case 'error':
                return 'border-red-200 bg-red-50';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50';
            case 'info':
            default:
                return 'border-blue-200 bg-blue-50';
        }
    };

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        backdrop-blur-sm bg-background/95 border-border
        min-w-[300px] max-w-md
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right-full
        ${getStyles()}
      `}
        >
            {getIcon()}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">{toast.title}</h4>
                {toast.message && (
                    <p className="text-sm text-muted-foreground mt-1">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 p-1 rounded-md hover:bg-background/80 transition-colors"
            >
                <X className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
    );
}
