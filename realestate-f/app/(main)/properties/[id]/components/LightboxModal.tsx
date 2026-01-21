import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxModalProps {
    show: boolean;
    onClose: () => void;
    images: string[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    propertyTitle: string;
}

export default function LightboxModal({
    show,
    onClose,
    images,
    currentIndex,
    onIndexChange,
    propertyTitle
}: LightboxModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-full w-full">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 btn btn-circle btn-ghost text-white hover:bg-white/20"
                >
                    ✕
                </button>

                <div className="relative h-full flex items-center justify-center">
                    <img
                        src={images[currentIndex]}
                        alt={propertyTitle}
                        className="max-w-full max-h-[85vh] object-contain"
                    />

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost text-white hover:bg-white/20"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={() => onIndexChange((currentIndex + 1) % images.length)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost text-white hover:bg-white/20"
                            >
                                <ChevronRight size={32} />
                            </button>

                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onIndexChange(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                                ? 'bg-white'
                                                : 'bg-white/50 hover:bg-white/70'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="absolute bottom-4 right-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}