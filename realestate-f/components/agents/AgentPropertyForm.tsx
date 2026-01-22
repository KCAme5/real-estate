'use client';

import React, { useEffect, useState } from 'react';
import { Upload, ArrowLeft, X, Plus, Trash2, Square, Bed, Bath, Maximize, Calendar, FileVideo, Image as ImageIcon, ChevronDown, ChevronUp, MapPin, DollarSign, Home, Star, Link, AlertCircle } from 'lucide-react';
import { propertyAPI, PropertyData } from '@/lib/api/properties';

interface FormErrors {
    [key: string]: string;
}

interface CollapsibleSection {
    id: 'basic' | 'pricing' | 'location' | 'specifications' | 'images' | 'owner';
    title: string;
    icon: React.ReactNode;
    isRequired: boolean;
    isExpanded: boolean;
}

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
    // Basic Information
    const [title, setTitle] = useState(initial?.title || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [propertyType, setPropertyType] = useState(initial?.property_type || 'apartment');
    const [listingType, setListingType] = useState(initial?.listing_type || 'sale');

    // Pricing
    const [price, setPrice] = useState(initial?.price ? String(initial.price) : '');
    const [currency, setCurrency] = useState(initial?.currency || 'KES');

    // Location
    const [location, setLocation] = useState<number | string>(initial?.location?.id || '');
    const [customLocation, setCustomLocation] = useState('');
    const [address, setAddress] = useState(initial?.address || '');
    const [latitude, setLatitude] = useState(initial?.latitude || '');
    const [longitude, setLongitude] = useState(initial?.longitude || '');

    // Property Specifications
    const [bedrooms, setBedrooms] = useState(initial?.bedrooms || '');
    const [bathrooms, setBathrooms] = useState(initial?.bathrooms || '');
    const [squareFeet, setSquareFeet] = useState(initial?.square_feet || '');
    const [plotSize, setPlotSize] = useState(initial?.plot_size || '');
    const [yearBuilt, setYearBuilt] = useState(initial?.year_built || '');

    // Features & Media
    const [features, setFeatures] = useState<string[]>(initial?.features || []);
    const [featureInput, setFeatureInput] = useState('');
    const [videoUrl, setVideoUrl] = useState(initial?.video_url || '');

    // Images
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [previewUrls, setPreviewUrls] = useState<string[]>(
        initial?.property_images ? initial.property_images.map((i: any) => i.image) :
            (initial?.main_image ? [initial.main_image] : [])
    );
    const [existingImages, setExistingImages] = useState<any[]>(initial?.property_images || []);

    // Owner Information
    const [ownerName, setOwnerName] = useState(initial?.owner_name || '');
    const [ownerPhone, setOwnerPhone] = useState(initial?.owner_phone || '');

    // UI State
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [locations, setLocations] = useState<any[]>([]);
    const [sections, setSections] = useState<CollapsibleSection[]>([
        { id: 'basic', title: 'Basic Information', icon: <Home size={16} />, isRequired: true, isExpanded: true },
        { id: 'pricing', title: 'Pricing', icon: <DollarSign size={16} />, isRequired: true, isExpanded: true },
        { id: 'location', title: 'Location Details', icon: <MapPin size={16} />, isRequired: true, isExpanded: false },
        { id: 'specifications', title: 'Property Specifications', icon: <Square size={16} />, isRequired: false, isExpanded: false },
        { id: 'images', title: 'Property Images', icon: <ImageIcon size={16} />, isRequired: false, isExpanded: false },
        { id: 'owner', title: 'Owner Information', icon: <AlertCircle size={16} />, isRequired: false, isExpanded: false },
    ]);

    useEffect(() => {
        // Load locations
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

    const toggleSection = (sectionId: string) => {
        setSections(prev => prev.map(section =>
            section.id === sectionId
                ? { ...section, isExpanded: !section.isExpanded }
                : section
        ));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required fields validation
        if (!title.trim()) newErrors.title = 'Property title is required';
        if (!price.trim() || isNaN(Number(price))) newErrors.price = 'Valid price is required';
        if (!location && !customLocation.trim()) newErrors.location = 'Location is required';

        // URL validation for image URLs
        imageUrls.forEach((url, index) => {
            if (!isValidUrl(url)) {
                newErrors[`imageUrl_${index}`] = 'Invalid URL format';
            }
        });

        if (videoUrl && !isValidUrl(videoUrl)) {
            newErrors.videoUrl = 'Invalid video URL format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string: string): boolean => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const addFeature = () => {
        if (featureInput.trim() && !features.includes(featureInput.trim())) {
            setFeatures([...features, featureInput.trim()]);
            setFeatureInput('');
        }
    };

    const removeFeature = (featureToRemove: string) => {
        setFeatures(features.filter(f => f !== featureToRemove));
    };

    const addImageUrl = () => {
        if (imageUrlInput.trim() && isValidUrl(imageUrlInput.trim()) && !imageUrls.includes(imageUrlInput.trim())) {
            setImageUrls([...imageUrls, imageUrlInput.trim()]);
            setPreviewUrls([...previewUrls, imageUrlInput.trim()]);
            setImageUrlInput('');
        }
    };

    const removeImageUrl = (urlToRemove: string) => {
        setImageUrls(imageUrls.filter(url => url !== urlToRemove));
        setPreviewUrls(previewUrls.filter(url => url !== urlToRemove));
    };

    const handleImageUpload = (files: FileList | null, isMain: boolean = false) => {
        if (!files) return;

        const fileArray = Array.from(files);
        if (isMain) {
            setImages([fileArray[0], ...images]);
            setPreviewUrls([URL.createObjectURL(fileArray[0]), ...previewUrls]);
        } else {
            setImages([...images, ...fileArray]);
            const newPreviews = fileArray.map(file => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            // Expand sections with errors
            const errorSectionIds = new Set(Object.keys(errors).map(key => {
                if (['title', 'description', 'propertyType', 'listingType'].includes(key)) return 'basic';
                if (['price', 'currency'].includes(key)) return 'pricing';
                if (['location', 'address', 'latitude', 'longitude'].includes(key)) return 'location';
                if (['bedrooms', 'bathrooms', 'squareFeet', 'plotSize', 'yearBuilt'].includes(key)) return 'specifications';
                if (['videoUrl'].includes(key)) return 'images';
                if (['ownerName', 'ownerPhone'].includes(key)) return 'owner';
                return 'basic';
            }));

            setSections(prev => prev.map(section => ({
                ...section,
                isExpanded: errorSectionIds.has(section.id) || section.isRequired
            })));
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();

            // Basic Information
            fd.append('title', title);
            fd.append('description', description);
            fd.append('property_type', propertyType);
            fd.append('listing_type', listingType);

            // Pricing
            fd.append('price', price);
            fd.append('currency', currency);

            // Location
            const locationValue = customLocation.trim() || location;
            fd.append('location', locationValue.toString());
            if (address) fd.append('address', address);
            if (latitude) fd.append('latitude', latitude);
            if (longitude) fd.append('longitude', longitude);

            // Specifications
            if (bedrooms) fd.append('bedrooms', bedrooms);
            if (bathrooms) fd.append('bathrooms', bathrooms);
            if (squareFeet) fd.append('square_feet', squareFeet);
            if (plotSize) fd.append('plot_size', plotSize);
            if (yearBuilt) fd.append('year_built', yearBuilt);

            // Features
            if (features.length > 0) fd.append('features', JSON.stringify(features));

            // Media
            if (videoUrl) fd.append('video_url', videoUrl);

            // Images - files
            if (images.length > 0) {
                fd.append('main_image', images[0]);
                images.slice(1).forEach((f) => fd.append('images', f));
            }

            // Image URLs
            if (imageUrls.length > 0) {
                imageUrls.forEach((url) => fd.append('image_urls', url));
            }

            // Owner Info
            if (ownerName) fd.append('owner_name', ownerName);
            if (ownerPhone) fd.append('owner_phone', ownerPhone);

            let result;
            if (initial && initial.id) {
                result = await propertyAPI.updateProperty(initial.id, fd);
                if (onUpdated) onUpdated(result);
            } else {
                result = await propertyAPI.createProperty(fd);
                onCreated(result);
                // Reset form on successful creation
                resetForm();
            }
        } catch (err: any) {
            console.error('Property operation failed', err);

            // Extract detailed error message from API response
            let errorMessage = 'Failed to save property. Please try again.';

            if (err?.response?.data) {
                const errorData = err.response.data;

                // Handle field-specific errors
                if (typeof errorData === 'object' && errorData !== null) {
                    const errorMessages = [];

                    // Check for non-field errors
                    if (errorData.non_field_errors) {
                        errorMessages.push(errorData.non_field_errors.join(', '));
                    }

                    // Check for field-specific errors
                    Object.keys(errorData).forEach(field => {
                        if (field !== 'non_field_errors' && Array.isArray(errorData[field])) {
                            errorMessages.push(`${field}: ${errorData[field].join(', ')}`);
                        }
                    });

                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join('; ');
                    }
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPropertyType('apartment');
        setListingType('sale');
        setPrice('');
        setCurrency('KES');
        setLocation('');
        setCustomLocation('');
        setAddress('');
        setLatitude('');
        setLongitude('');
        setBedrooms('');
        setBathrooms('');
        setSquareFeet('');
        setPlotSize('');
        setYearBuilt('');
        setFeatures([]);
        setFeatureInput('');
        setVideoUrl('');
        setImages([]);
        setImageUrls([]);
        setImageUrlInput('');
        setPreviewUrls([]);
        setOwnerName('');
        setOwnerPhone('');
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        {initial ? 'Edit Property' : 'Create New Property'}
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

                {/* Collapsible Sections */}
                <div className="space-y-4">
                    {sections.map((section) => (
                        <div key={section.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleSection(section.id)}
                                className={`w-full px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${section.isRequired ? 'border-l-4 border-l-primary' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {section.icon}
                                    <span className="font-semibold text-foreground">
                                        {section.title}
                                        {section.isRequired && <span className="text-primary ml-1">*</span>}
                                    </span>
                                </div>
                                {section.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {section.isExpanded && (
                                <div className="p-6 bg-white dark:bg-slate-800">
                                    {section.id === 'basic' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className={`space-y-2 ${errors.title ? 'text-error' : ''}`}>
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Property Title *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700 ${errors.title ? 'border-error' : 'border-slate-300 dark:border-slate-600'
                                                            }`}
                                                        placeholder="Enter a descriptive title"
                                                    />
                                                    {errors.title && <p className="text-xs text-error">{errors.title}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Property Type
                                                    </label>
                                                    <select
                                                        value={propertyType}
                                                        onChange={(e) => setPropertyType(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                    >
                                                        <option value="apartment">Apartment/Flat</option>
                                                        <option value="townhouse">Townhouse</option>
                                                        <option value="maisonette">Maisonette</option>
                                                        <option value="land">Land/Plot</option>
                                                        <option value="commercial">Commercial Property</option>
                                                        <option value="office">Office</option>
                                                        <option value="duplex">Duplex</option>
                                                        <option value="bungalow">Bungalow</option>
                                                        <option value="villa">Villa</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold uppercase tracking-wider">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                    placeholder="Describe property..."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold uppercase tracking-wider">
                                                    Listing Type
                                                </label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            value="sale"
                                                            checked={listingType === 'sale'}
                                                            onChange={(e) => setListingType(e.target.value)}
                                                            className="mr-2"
                                                        />
                                                        For Sale
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            value="rent"
                                                            checked={listingType === 'rent'}
                                                            onChange={(e) => setListingType(e.target.value)}
                                                            className="mr-2"
                                                        />
                                                        For Rent
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'pricing' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className={`space-y-2 ${errors.price ? 'text-error' : ''}`}>
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Price *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={price}
                                                        onChange={(e) => setPrice(e.target.value)}
                                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700 ${errors.price ? 'border-error' : 'border-slate-300 dark:border-slate-600'
                                                            }`}
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                    {errors.price && <p className="text-xs text-error">{errors.price}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Currency
                                                    </label>
                                                    <select
                                                        value={currency}
                                                        onChange={(e) => setCurrency(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                    >
                                                        <option value="KES">Kenyan Shilling (KES)</option>
                                                        <option value="USD">US Dollar (USD)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'location' && (
                                        <div className="space-y-4">
                                            <div className={`space-y-2 ${errors.location ? 'text-error' : ''}`}>
                                                <label className="block text-sm font-bold uppercase tracking-wider">
                                                    Area Name *
                                                </label>
                                                <select
                                                    value={location}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setLocation(val);
                                                        if (val !== 'custom') setCustomLocation('');
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700 ${errors.location ? 'border-error' : 'border-slate-300 dark:border-slate-600'
                                                        }`}
                                                >
                                                    <option value="">Select a location</option>
                                                    {locations.map((loc) => (
                                                        <option key={loc.id} value={loc.id}>{loc.name}, {loc.county}</option>
                                                    ))}
                                                    <option value="custom">+ Add New Location</option>
                                                </select>

                                                {location === 'custom' && (
                                                    <input
                                                        type="text"
                                                        value={customLocation}
                                                        onChange={(e) => setCustomLocation(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700 mt-2"
                                                        placeholder="Enter new location name"
                                                    />
                                                )}
                                                {errors.location && <p className="text-xs text-error">{errors.location}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold uppercase tracking-wider">
                                                    Address (Optional)
                                                </label>
                                                <textarea
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                    placeholder="Enter full address..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Latitude (Optional)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={latitude}
                                                        onChange={(e) => setLatitude(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                        placeholder="-1.2921"
                                                        step="0.000001"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Longitude (Optional)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={longitude}
                                                        onChange={(e) => setLongitude(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                        placeholder="36.8219"
                                                        step="0.000001"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'specifications' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        <Bed size={14} className="inline mr-1" />
                                                        Bedrooms
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={bedrooms}
                                                        onChange={(e) => setBedrooms(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        <Bath size={14} className="inline mr-1" />
                                                        Bathrooms
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={bathrooms}
                                                        onChange={(e) => setBathrooms(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        <Maximize size={14} className="inline mr-1" />
                                                        Square Feet
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={squareFeet}
                                                        onChange={(e) => setSquareFeet(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Plot Size
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={plotSize}
                                                        onChange={(e) => setPlotSize(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        <Calendar size={14} className="inline mr-1" />
                                                        Year Built
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={yearBuilt}
                                                        onChange={(e) => setYearBuilt(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                        placeholder="2024"
                                                        min="1900"
                                                        max={new Date().getFullYear()}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'images' && (
                                        <div className="space-y-6">
                                            {/* File Upload Section */}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Upload Images from Computer
                                                    </label>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        {/* Main Image */}
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium">Main Image</label>
                                                            <div className="relative group">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImageUpload(e.target.files, true)}
                                                                    className="hidden"
                                                                    id="main-image-upload"
                                                                />
                                                                <label
                                                                    htmlFor="main-image-upload"
                                                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-slate-50 dark:bg-slate-700"
                                                                >
                                                                    {previewUrls.length > 0 && images.length > 0 ? (
                                                                        <img
                                                                            src={previewUrls[0]}
                                                                            alt="Main image preview"
                                                                            className="w-full h-full object-cover rounded-xl"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                                            <Upload size={24} />
                                                                            <p className="text-xs mt-1">Main Image</p>
                                                                        </div>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        </div>

                                                        {/* Additional Images */}
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium">Additional Images</label>
                                                            <div className="relative group">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    multiple
                                                                    onChange={(e) => handleImageUpload(e.target.files, false)}
                                                                    className="hidden"
                                                                    id="additional-images-upload"
                                                                />
                                                                <label
                                                                    htmlFor="additional-images-upload"
                                                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-slate-50 dark:bg-slate-700"
                                                                >
                                                                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                                        <Upload size={24} />
                                                                        <p className="text-xs mt-1">Multiple Images</p>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Image URLs Section */}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        <Link size={14} className="inline mr-1" />
                                                        Add Image URLs (Cloudinary, etc.)
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="url"
                                                            value={imageUrlInput}
                                                            onChange={(e) => setImageUrlInput(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                                                            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                            placeholder="https://example.com/image.jpg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={addImageUrl}
                                                            className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {imageUrls.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium">Added URLs:</p>
                                                        <div className="space-y-2">
                                                            {imageUrls.map((url, index) => (
                                                                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                                                    <img src={url} alt={`Preview ${index}`} className="w-12 h-12 object-cover rounded" />
                                                                    <span className="flex-1 text-xs truncate">{url}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeImageUrl(url)}
                                                                        className="p-1 text-red-500 hover:text-red-600"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Video URL */}
                                            <div className={`space-y-2 ${errors.videoUrl ? 'text-error' : ''}`}>
                                                <label className="block text-sm font-bold uppercase tracking-wider">
                                                    <FileVideo size={14} className="inline mr-1" />
                                                    Video Tour URL (Optional)
                                                </label>
                                                <input
                                                    type="url"
                                                    value={videoUrl}
                                                    onChange={(e) => setVideoUrl(e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700 ${errors.videoUrl ? 'border-error' : 'border-slate-300 dark:border-slate-600'
                                                        }`}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                />
                                                {errors.videoUrl && <p className="text-xs text-error">{errors.videoUrl}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'owner' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Owner Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={ownerName}
                                                        onChange={(e) => setOwnerName(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                        placeholder="Property owner name"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                                        Owner Phone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={ownerPhone}
                                                        onChange={(e) => setOwnerPhone(e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 dark:bg-slate-700"
                                                        placeholder="+254 700 000 000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
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
                                {initial ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <Plus size={16} />
                                {initial ? 'Update Property' : 'Create Property'}
                            </>
                        )}
                    </button>
                    {!initial && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            Reset Form
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}
