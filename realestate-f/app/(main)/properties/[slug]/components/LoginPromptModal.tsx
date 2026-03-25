import { LogIn } from 'lucide-react';

interface LoginPromptModalProps {
    show: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export default function LoginPromptModal({ show, onClose, onLogin }: LoginPromptModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="modal modal-open">
                <div className="modal-box max-w-md text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <LogIn className="text-primary" size={32} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-base-content mb-2">
                        Login Required
                    </h3>
                    <p className="text-base-content/70 mb-6">
                        Please log in to save properties and access all features.
                    </p>
                    <div className="modal-action justify-center">
                        <button
                            onClick={onClose}
                            className="btn btn-ghost"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={onLogin}
                            className="btn btn-primary gap-2"
                        >
                            <LogIn size={20} />
                            Login Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}