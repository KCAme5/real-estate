'use client';

import React, { useEffect, useState } from 'react';
import { Upload, ArrowLeft, X, Plus, Trash2, Square, Bed, Bath, Maximize, Calendar, FileVideo, Image as ImageIcon, ChevronDown, ChevronUp, MapPin, DollarSign, Home, Star, Link, AlertCircle } from 'lucide-react';
import { propertyAPI, PropertyData } from '@/lib/api/properties';

interface FormErrors {
    [key: string]: string;
}

interface FormStep {
    id: string;
    title: string;
    icon: React.ReactNode;
    isRequired: boolean;
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

    // Step Management
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [locations, setLocations] = useState<any[]>([]);

    const formSteps: FormStep[] = [
        { id: 'basic', title: 'Basic Info', icon: <Home size={16} />, isRequired: true },
        { id: 'location', title: 'Location', icon: <MapPin size={16} />, isRequired: true },
        { id: 'details', title: 'Details', icon: <Square size={16} />, isRequired: false },
        { id: 'images', title: 'Media', icon: <ImageIcon size={16} />, isRequired: false },
        { id: 'review', title: 'Review', icon: <AlertCircle size={16} />, isRequired: false },
    ];

    const nextStep = () => {
        if (currentStep < formSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (stepIndex: number) => {
        if (stepIndex >= 0 && stepIndex < formSteps.length) {
            setCurrentStep(stepIndex);
        }
    };

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

    const validateCurrentStep = (): boolean => {
        const newErrors: FormErrors = {};

        // Validate based on current step
        switch (formSteps[currentStep].id) {
            case 'basic':
                if (!title.trim()) newErrors.title = 'Property title is required';
                if (!price.trim() || isNaN(Number(price))) newErrors.price = 'Valid price is required';
                break;
            case 'location':
                if (!location && !customLocation.trim()) newErrors.location = 'Location is required';
                break;
            case 'images':
                imageUrls.forEach((url, index) => {
                    if (!isValidUrl(url)) {
                        newErrors[`imageUrl_${index}`] = 'Invalid URL format';
                    }
                });
                if (videoUrl && !isValidUrl(videoUrl)) {
                    newErrors.videoUrl = 'Invalid video URL format';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

        // If not on review step, just move to next step
        if (currentStep < formSteps.length - 1) {
            if (validateCurrentStep()) {
                nextStep();
            }
            return;
        }

        // On review step, submit the form
        if (!validateForm()) {
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

            // Location - handle both PK and custom location
            if (customLocation.trim()) {
                // For custom location, send as string and let backend handle it
                fd.append('custom_location', customLocation.trim());
            } else if (location && typeof location === 'number') {
                // For existing locations, send the PK as string
                fd.append('location', location.toString());
            }
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

            // Images - handle both file uploads and URLs
            if (images.length > 0) {
                // If we have file uploads, convert to base64 or handle appropriately
                // For now, let's skip file upload and rely on image URLs
                console.log('File uploads detected - using image URLs instead');
            }

            // Always send image URLs as the main image source
            if (imageUrls.length > 0) {
                // Send all URLs to image_urls array - backend will set first as main image
                imageUrls.forEach((url) => fd.append('image_urls', url));
            } else if (previewUrls.length > 0) {
                // Fallback to preview URLs if available
                previewUrls.forEach((url) => fd.append('image_urls', url));
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
            <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        {initial ? 'Edit Property' : 'Create New Property'}
                    </h2>
                    {initial && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {formSteps.map((step, index) => (
                            <div
                                key={step.id}
                                className="flex items-center cursor-pointer"
                                onClick={() => goToStep(index)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index <= currentStep
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {step.icon}
                                </div>
                                {index < formSteps.length - 1 && (
                                    <div
                                        className={`w-16 h-1 mx-2 transition-colors ${index < currentStep
                                            ? 'bg-primary'
                                            : 'bg-muted'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between">
                        {formSteps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`text-xs font-medium text-center cursor-pointer ${index === currentStep
                                    ? 'text-primary'
                                    : index < currentStep
                                        ? 'text-muted-foreground'
                                        : 'text-muted-foreground'
                                    }`}
                                onClick={() => goToStep(index)}
                            >
                                {step.title}
                                {step.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <Home size={20} className="text-primary" />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className={`space-y-2 ${errors.title ? 'text-destructive' : ''}`}>
                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                        Property Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background ${errors.title ? 'border-destructive' : 'border-border'
                                            }`}
                                        placeholder="Enter a descriptive title"
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                        Property Type
                                    </label>
                                    <select
                                        value={propertyType}
                                        onChange={(e) => setPropertyType(e.target.value)}
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background text-foreground"
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

                                <div className={`space-y-2 ${errors.price ? 'text-destructive' : ''}`}>
                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background ${errors.price ? 'border-destructive' : 'border-border'
                                            }`}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                        Currency
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background text-foreground"
                                    >
                                        <option value="KES">Kenyan Shilling (KES)</option>
                                        <option value="USD">US Dollar (USD)</option>
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
                                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
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

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <MapPin size={20} className="text-primary" />
                                Location Details
                            </h3>

                            <div className={`space-y-2 ${errors.location ? 'text-destructive' : ''}`}>
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
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background text-foreground ${errors.location ? 'border-destructive' : 'border-border'
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
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background mt-2"
                                        placeholder="Enter new location name"
                                    />
                                )}
                                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold uppercase tracking-wider">
                                    Address (Optional)
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
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
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
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
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
                                        placeholder="36.8219"
                                        step="0.000001"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <Square size={20} className="text-primary" />
                                Property Specifications
                            </h3>

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
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
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
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
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
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                        Plot Size
                                    </label>
                                    <input
                                        type="text"
                                        value={plotSize}
                                        onChange={(e) => setPlotSize(e.target.value)}
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
                                        placeholder="e.g., 0.25 acres"
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
                                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
                                        placeholder="2024"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <ImageIcon size={20} className="text-primary" />
                                Media & Images
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                        Upload Images from Computer
                                    </label>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-foreground">Main Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e.target.files, true)}
                                                className="hidden"
                                                id="main-image-upload"
                                            />
                                            <label
                                                htmlFor="main-image-upload"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-background"
                                            >
                                                {previewUrls.length > 0 && images.length > 0 ? (
                                                    <div className="relative">
                                                        <img src={previewUrls[0]} alt="Main preview" className="w-full h-full object-cover rounded-lg" />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                removeImage(0);
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                        <Upload size={24} />
                                                        <p className="text-xs mt-1">Main Image</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-foreground">Additional Images</label>
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
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-background"
                                            >
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <Upload size={24} />
                                                    <p className="text-xs mt-1">Multiple Images</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {previewUrls.length > 1 && (
                                        <div className="grid grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
                                            {previewUrls.slice(1).map((url, index) => (
                                                <div key={index} className="relative">
                                                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-border" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index + 1)}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                        Add Image URLs
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={imageUrlInput}
                                            onChange={(e) => setImageUrlInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                                            className="flex-1 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
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

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold uppercase tracking-wider">
                                        Video URL (Optional)
                                    </label>
                                    <div className="flex gap-2">
                                        <Link size={16} className="text-muted-foreground" />
                                        <input
                                            type="url"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            className="flex-1 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 transition-all bg-background"
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                    </div>
                                    {errors.videoUrl && <p className="text-xs text-destructive">{errors.videoUrl}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <AlertCircle size={20} className="text-primary" />
                                Review & Submit
                            </h3>

                            <div className="bg-muted rounded-xl p-6 space-y-4">
                                <h4 className="font-semibold text-foreground">Property Summary</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-muted-foreground">Title:</span>
                                        <p className="text-foreground">{title || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Price:</span>
                                        <p className="text-foreground">{price ? `${currency} ${price}` : 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Type:</span>
                                        <p className="text-foreground">{propertyType}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Listing:</span>
                                        <p className="text-foreground">{listingType}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Location:</span>
                                        <p className="text-foreground">
                                            {location && typeof location === 'number'
                                                ? locations.find(l => l.id === location)?.name || 'Unknown location'
                                                : customLocation || location || 'Not provided'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Bedrooms:</span>
                                        <p className="text-foreground">{bedrooms || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Bathrooms:</span>
                                        <p className="text-foreground">{bathrooms || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Square Feet:</span>
                                        <p className="text-foreground">{squareFeet || 'Not specified'}</p>
                                    </div>
                                </div>

                                {description && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Description:</span>
                                        <p className="text-foreground text-sm mt-1">{description}</p>
                                    </div>
                                )}

                                {previewUrls.length > 0 && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Images:</span>
                                        <p className="text-foreground text-sm mt-1">{previewUrls.length} image(s) uploaded</p>
                                    </div>
                                )}

                                {videoUrl && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Video:</span>
                                        <p className="text-foreground text-sm mt-1">Video URL provided</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Please review all the information above before submitting. Click "Create Property" to list your property.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-border">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`px-6 py-3 rounded-xl font-medium transition-colors ${currentStep === 0
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                    >
                        Previous
                    </button>

                    <div className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {formSteps.length}
                    </div>

                    <button
                        type="submit"
                        className={`px-6 py-3 rounded-xl font-medium transition-colors ${currentStep === formSteps.length - 1
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                    >
                        {currentStep === formSteps.length - 1
                            ? (loading ? 'Creating...' : (initial ? 'Update Property' : 'Create Property'))
                            : 'Next'
                        }
                    </button>
                </div>

            </div>
        </form>
    );
}
