'use client';

import React, { useEffect, useState } from 'react';
import { Upload, ArrowLeft, X, Plus, Trash2, Square, Bed, Bath, Maximize, Calendar, FileVideo, Image as ImageIcon } from 'lucide-react';
import { propertyAPI, PropertyData } from '@/lib/api/properties';

export default function AgentPropertyForm({
    onCreated,
    initial,
    onCancel,
    onUpdated,
    locationsLoading,
}: {
    onCreated: (p: any) => void;
    initial?: any;
    onCancel?: () => void;
    onUpdated?: (p: any) => void;
    locationsLoading?: boolean;
}) {
    const [title, setTitle] = useState(initial?.title || '');
    const [price, setPrice] = useState(initial?.price ? String(initial.price) : '');
    const [location, setLocation] = useState<number | string>(initial?.location?.id || '');
    const [locations, setLocations] = useState<any[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>(initial?.property_images ? initial.property_images.map((i: any) => i.image) : (initial?.main_image ? [initial.main_image] : []));
    const [existingImages, setExistingImages] = useState<any[]>(initial?.property_images || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If initial changes, update form fields
        setTitle(initial?.title || '');
        setPrice(initial?.price ? String(initial.price) : '');
        setLocation(initial?.location?.id || '');
        setPreviewUrls(initial?.property_images ? initial.property_images.map((i: any) => i.image) : (initial?.main_image ? [initial.main_image] : []));
        setExistingImages(initial?.property_images || []);
        setImages([]);
    }, [initial]);

    useEffect(() => {
        // load available locations for select
        let mounted = true;
        (async () => {
            try {
                const data = await propertyAPI.getLocations();
                if (mounted) setLocations(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error('Failed to load locations', e);
            }
        })();
        return () => { mounted = false };
    }, []);

    // Reset loading state when locations are loaded
    useEffect(() => {
        if (locations.length > 0 && !locationsLoading) {
            // Don't override external loading state if it's provided
        }
    }, [locations.length, locationsLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let result;
            const formData: PropertyData = { title, price, location: location as any };

            // Add files to form data if we have them
            if (images.length > 0) {
                const fd = new FormData();
                fd.append('title', title);
                fd.append('price', price);
                fd.append('location', location.toString());
                images.forEach((f) => fd.append('images', f));
                // Use FormData directly
                if (initial && initial.id) {
                    result = await propertyAPI.updateProperty(initial.id, fd);
                } else {
                    result = await propertyAPI.createProperty(fd);
                }
            } else {
                // Use regular JSON data
                if (initial && initial.id) {
                    result = await propertyAPI.updateProperty(initial.id, formData);
                } else {
                    result = await propertyAPI.createProperty(formData);
                }
            }

            if (initial && initial.id) {
                if (onUpdated) onUpdated(result);
            } else {
                onCreated(result);
                // Reset form on successful creation
                setTitle('');
                setPrice('');
                setLocation('');
                setImages([]);
                setPreviewUrls([]);
            }
        } catch (err: any) {
            console.error('Property operation failed', err);
            const errorMessage = err?.message || 'Failed to save property. Please try again.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                        {initial ? 'Edit Property' : 'Property Details'}
                    </h2>
                    {initial && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">Property Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 dark:bg-slate-700"
                            placeholder="Enter a descriptive title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">Location *</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 dark:bg-slate-700"
                            placeholder="Enter property location (e.g., Kilimani, Nairobi CBD, Westlands)"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground uppercase tracking-wider">Price *</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 dark:bg-slate-700"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
            </div>

            {/* Images Section */}
            <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Upload size={20} />
                    Property Images
                </h3>

                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider">Main Image</label>
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setImages((prev) => [file, ...prev]);
                                        setPreviewUrls([URL.createObjectURL(file), ...previewUrls]);
                                    }
                                }}
                                className="hidden"
                                id="main-image-edit"
                            />
                            <label
                                htmlFor="main-image-edit"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-slate-50 dark:bg-slate-700 group-hover:bg-slate-100 dark:group-hover:bg-slate-600"
                            >
                                {previewUrls.length > 0 ? (
                                    <img
                                        src={previewUrls[0]}
                                        alt="Main image preview"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                        <Upload size={32} />
                                        <p className="text-sm font-medium mt-2">Click to upload main image</p>
                                        <p className="text-xs">JPG, PNG up to 10MB</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Additional Images */}
                    <div>
                        <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">Additional Images</label>
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length > 0) {
                                        const newPreviews = files.map(file => URL.createObjectURL(file));
                                        setPreviewUrls(prev => [...prev, ...newPreviews]);
                                        setImages(prev => [...prev, ...files]);
                                    }
                                }}
                                className="hidden"
                                id="additional-images-edit"
                            />
                            <label
                                htmlFor="additional-images-edit"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-slate-50 dark:bg-slate-700 group-hover:bg-slate-100 dark:group-hover:bg-slate-600"
                            >
                                {previewUrls.length > 1 ? (
                                    <div className="grid grid-cols-4 gap-2 p-4 w-full">
                                        {previewUrls.slice(1).map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const removeIndex = index + 1;
                                                        setPreviewUrls(prev => prev.filter((_, i) => i !== removeIndex));
                                                        setImages(prev => prev.filter((_, i) => i !== removeIndex));
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Add more button */}
                                        <label
                                            htmlFor="additional-images-edit"
                                            className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-slate-100 dark:bg-slate-700"
                                        >
                                            <Plus size={16} />
                                            <span className="text-xs mt-1">Add More</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                        <Upload size={32} />
                                        <p className="text-sm font-medium mt-2">Click to upload images</p>
                                        <p className="text-xs">Multiple files allowed</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Existing Images Display */}
                    {existingImages.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">Current Images</p>
                            <div className="grid grid-cols-4 gap-2">
                                {existingImages.map((img, idx) => (
                                    <div key={`existing-${img.id}`} className="relative">
                                        <img
                                            src={img.image}
                                            alt={`existing-${idx}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!confirm('Remove this image?')) return;
                                                try {
                                                    await propertyAPI.deletePropertyImage(img.id);
                                                    setExistingImages(prev => prev.filter(i => i.id !== img.id));
                                                    setPreviewUrls(prev => prev.filter(u => u !== img.image));
                                                } catch (e) {
                                                    console.error('Failed to delete image', e);
                                                    alert('Failed to delete image');
                                                }
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-200 dark:border-slate-700">
                <button
                    type="submit"
                    className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {initial ? 'Updating...' : 'Saving...'}
                        </>
                    ) : (
                        <>
                            <Plus size={16} />
                            {initial ? 'Update Property' : 'Save Property'}
                        </>
                    )}
                </button>
                {!initial && (
                    <button
                        type="button"
                        onClick={() => {
                            setTitle('');
                            setPrice('');
                            setLocation('');
                            setImages([]);
                            setPreviewUrls([]);
                            setExistingImages([]);
                        }}
                        className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}
