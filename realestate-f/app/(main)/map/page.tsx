import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), {
    ssr: false,
    loading: () => (
        <div className="relative h-screen w-full bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-medium">Loading map...</p>
            </div>
        </div>
    ),
});

export default function MapPage() {
    return <MapView />;
}
