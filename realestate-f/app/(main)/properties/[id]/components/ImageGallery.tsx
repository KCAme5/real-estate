import { ChevronLeft, ChevronRight, Maximize2, Home, Grid } from 'lucide-react';

interface ImageGalleryProps {
    property: any;
    activeImage: number;
    setActiveImage: (index: number | ((prev: number) => number)) => void;
    onLightboxOpen: () => void;
}

export default function ImageGallery({
    property,
    activeImage,
    setActiveImage,
    onLightboxOpen
}: ImageGalleryProps) {
    const getImageUrls = () => {
        if (!property) return [];

        const urls = [];

        if (property.main_image_url) {
            urls.push(property.main_image_url);
        } else if (property.main_image) {
            urls.push(property.main_image);
        }

        if (property.images && Array.isArray(property.images)) {
            property.images.forEach((img: any) => {
                if (img.image && typeof img.image === 'string') {
                    urls.push(img.image);
                }
            });
        }

        return [...new Set(urls.filter((url: string) => url && url.trim() !== ''))];
    };

    const allImages = getImageUrls();

    return (
        <div className="space-y-6">
            <div className="group relative bg-card border border-border/50 rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px]">
                {allImages.length > 0 ? (
                    <>
                        <img
                            src={allImages[activeImage]}
                            alt={property.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 cursor-zoom-in"
                            onClick={onLightboxOpen}
                        />

                        {/* Overlays */}
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />

                        {/* Controls */}
                        {allImages.length > 1 && (
                            <div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length);
                                    }}
                                    className="p-4 bg-background/20 backdrop-blur-2xl text-white rounded-full hover:bg-white hover:text-black transition-all shadow-2xl border border-white/20"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImage((prev) => (prev + 1) % allImages.length);
                                    }}
                                    className="p-4 bg-background/20 backdrop-blur-2xl text-white rounded-full hover:bg-white hover:text-black transition-all shadow-2xl border border-white/20"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}

                        <div className="absolute top-8 right-8 flex items-center gap-3">
                            <button
                                onClick={onLightboxOpen}
                                className="px-6 py-3 bg-background/20 backdrop-blur-2xl text-white rounded-full text-xs font-black uppercase tracking-widest border border-white/20 hover:bg-white hover:text-black transition-all shadow-2xl flex items-center gap-2"
                            >
                                <Maximize2 size={16} />
                                Fullscreen
                            </button>
                        </div>

                        <div className="absolute bottom-8 left-8 flex items-center gap-3">
                            <div className="px-5 py-2.5 bg-background/20 backdrop-blur-2xl text-white rounded-full text-xs font-black uppercase tracking-widest border border-white/20 shadow-2xl">
                                {activeImage + 1} <span className="text-white/40 px-1">/</span> {allImages.length}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <Home className="text-muted-foreground" size={40} />
                            </div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">No Visuals Available</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
                    {allImages.map((image: string, index: number) => (
                        <button
                            key={index}
                            onClick={() => setActiveImage(index)}
                            className={`shrink-0 w-24 h-20 md:w-32 md:h-24 rounded-[1.5rem] overflow-hidden border-2 transition-all p-1 ${index === activeImage
                                    ? 'border-primary bg-primary/20 scale-105'
                                    : 'border-transparent hover:border-primary/50'
                                }`}
                        >
                            <img
                                src={image}
                                alt={`${property.title} ${index + 1}`}
                                className="w-full h-full object-cover rounded-[1.2rem]"
                            />
                        </button>
                    ))}
                    <button
                        onClick={onLightboxOpen}
                        className="shrink-0 w-24 h-20 md:w-32 md:h-24 rounded-[1.5rem] bg-muted flex flex-col items-center justify-center gap-2 border-2 border-transparent hover:border-primary/30 transition-all group"
                    >
                        <Grid size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">View All</span>
                    </button>
                </div>
            )}
        </div>
    );
}
