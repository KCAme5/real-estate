'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { propertyAPI } from '@/lib/api/properties';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import {
    Home,
    Upload,
    X,
    MapPin,
    DollarSign,
    Bed,
    Bath,
    Square,
    Calendar,
    FileText,
    Image as ImageIcon,
    Video,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';

const propertyTypes = [
    { value: 'apartment', label: 'Apartment/Flat' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'maisonette', label: 'Maisonette' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'villa', label: 'Villa' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'land', label: 'Land/Plot' },
    { value: 'commercial', label: 'Commercial Property' },
    { value: 'office', label: 'Office' },
];

const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'pending', label: 'Pending' },
    { value: 'sold', label: 'Sold' },
    { value: 'rented', label: 'Rented' },
];

const currencyOptions = [
    { value: 'KES', label: 'KES (Kenyan Shilling)' },
    { value: 'USD', label: 'USD (US Dollar)' },
];

const commonFeatures = [
    'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Security',
    'Backup Generator', 'Borehole', 'CCTV', 'Balcony', 'Terrace',
    'Elevator', 'Air Conditioning', 'Fitted Kitchen', 'Ensuite',
    'Walk-in Closet', 'Storage Room', 'Laundry Room', 'Fireplace',
    'Smart Home', 'Solar Panels'
];

export default function NewPropertyPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [customFeature, setCustomFeature] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        property_type: 'apartment',
        status: 'available',
        price: '',
        currency: 'KES',
        location: '',
        address: '',
        latitude: '',
        longitude: '',
        bedrooms: '',
        bathrooms: '',
        square_feet: '',
        plot_size: '',
        year_built: '',
        video_url: '',
        owner_name: '',
        owner_phone: '',
        main_image: null as File | null,
        images: [] as File[],
    });



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Main image must be less than 5MB');
                return;
            }
            setFormData(prev => ({ ...prev, main_image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setMainImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + formData.images.length > 10) {
            setError('Maximum 10 additional images allowed');
            return;
        }

        const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
        if (validFiles.length !== files.length) {
            setError('Some images were skipped (max 5MB each)');
        }

        setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeMainImage = () => {
        setFormData(prev => ({ ...prev, main_image: null }));
        setMainImagePreview(null);
    };

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        );
    };

    const addCustomFeature = () => {
        if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
            setSelectedFeatures(prev => [...prev, customFeature.trim()]);
            setCustomFeature('');
        }
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            setError('Property title is required');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Property description is required');
            return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Valid price is required');
            return false;
        }
        if (!formData.location) {
            setError('Location is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const submitData = new FormData();

            // Required fields
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('property_type', formData.property_type);
            submitData.append('price', formData.price);
            submitData.append('currency', formData.currency);
            submitData.append('location_name', formData.location);  // Backend expects location_name
            submitData.append('status', formData.status);

            // Optional text fields
            if (formData.address) submitData.append('address', formData.address);
            if (formData.bedrooms) submitData.append('bedrooms', formData.bedrooms);
            if (formData.bathrooms) submitData.append('bathrooms', formData.bathrooms);
            if (formData.square_feet) submitData.append('square_feet', formData.square_feet);
            if (formData.plot_size) submitData.append('plot_size', formData.plot_size);
            if (formData.year_built) submitData.append('year_built', formData.year_built);
            if (formData.latitude) submitData.append('latitude', formData.latitude);
            if (formData.longitude) submitData.append('longitude', formData.longitude);
            if (formData.video_url) submitData.append('video_url', formData.video_url);
            if (formData.owner_name) submitData.append('owner_name', formData.owner_name);
            if (formData.owner_phone) submitData.append('owner_phone', formData.owner_phone);

            // Features
            if (selectedFeatures.length > 0) {
                submitData.append('features', JSON.stringify(selectedFeatures));
            }

            // Images
            if (formData.main_image) {
                submitData.append('main_image', formData.main_image);
            }

            formData.images.forEach((image) => {
                submitData.append('images', image);
            });

            await propertyAPI.createProperty(submitData);
            setSuccess(true);

            setTimeout(() => {
                router.push('/dashboard/agent/properties');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to create property. Please try again.');
            console.error('Failed to create property:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <Breadcrumb />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Home className="text-primary" size={32} />
                            Create New Property Listing
                        </h1>
                        <p className="text-muted-foreground mt-1">Fill in all required details to list your property</p>
                    </div>
                </div>

                {success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
                        <div>
                            <p className="font-semibold text-green-900 dark:text-green-100">Property created successfully!</p>
                            <p className="text-sm text-green-700 dark:text-green-300">Redirecting to properties page...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                        <p className="text-red-900 dark:text-red-100">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Property Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., Luxury 3-Bedroom Apartment in Westlands"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Property Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="property_type"
                                    value={formData.property_type}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {propertyTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {statusOptions.map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Describe your property in detail..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <DollarSign size={20} className="text-primary" />
                            Pricing
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Price <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="5000000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Currency <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {currencyOptions.map(currency => (
                                        <option key={currency.value} value={currency.value}>{currency.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-primary" />
                            Location Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Location/Area Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., Westlands, Kilimani, Karen, Nairobi"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Specific Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Street address, building name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    step="0.000001"
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="-1.286389"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    step="0.000001"
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="36.817223"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Property Specifications</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Bed size={16} />
                                    Bedrooms
                                </label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Bath size={16} />
                                    Bathrooms
                                </label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Year Built
                                </label>
                                <input
                                    type="number"
                                    name="year_built"
                                    value={formData.year_built}
                                    onChange={handleInputChange}
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="2020"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Square size={16} />
                                    Square Feet
                                </label>
                                <input
                                    type="number"
                                    name="square_feet"
                                    value={formData.square_feet}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="1500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Plot Size (for land)
                                </label>
                                <input
                                    type="number"
                                    name="plot_size"
                                    value={formData.plot_size}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0.25 acres"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features & Amenities */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <Sparkles size={20} className="text-primary" />
                            Features & Amenities
                        </h2>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {commonFeatures.map(feature => (
                                    <button
                                        key={feature}
                                        type="button"
                                        onClick={() => toggleFeature(feature)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFeatures.includes(feature)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        {feature}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customFeature}
                                    onChange={(e) => setCustomFeature(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                                    className="flex-1 px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Add custom feature..."
                                />
                                <button
                                    type="button"
                                    onClick={addCustomFeature}
                                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
                                >
                                    Add
                                </button>
                            </div>

                            {selectedFeatures.length > 0 && (
                                <div className="pt-2">
                                    <p className="text-sm text-muted-foreground mb-2">Selected features:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFeatures.map(feature => (
                                            <span
                                                key={feature}
                                                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                            >
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleFeature(feature)}
                                                    className="hover:text-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <ImageIcon size={20} className="text-primary" />
                            Images & Media
                        </h2>

                        {/* Main Image */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">Main Image (Max 5MB)</label>
                            {mainImagePreview ? (
                                <div className="relative inline-block">
                                    <img src={mainImagePreview} alt="Main preview" className="w-64 h-64 object-cover rounded-lg border-2 border-primary" />
                                    <button
                                        type="button"
                                        onClick={removeMainImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-64 h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/20">
                                    <Upload className="text-muted-foreground mb-2" size={32} />
                                    <span className="text-sm text-muted-foreground">Click to upload main image</span>
                                    <input
                                        type="file"
                                        onChange={handleMainImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Additional Images */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Additional Images (Max 10 images, 5MB each)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-border" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {imagePreviews.length < 10 && (
                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/20">
                                        <Upload className="text-muted-foreground mb-1" size={20} />
                                        <span className="text-xs text-muted-foreground">Add images</span>
                                        <input
                                            type="file"
                                            onChange={handleImagesChange}
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Video URL */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <Video size={16} />
                                Video Tour URL (YouTube/Vimeo)
                            </label>
                            <input
                                type="url"
                                name="video_url"
                                value={formData.video_url}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>
                    </div>

                    {/* Owner Information */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Owner Information (Optional)</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Owner Name
                                </label>
                                <input
                                    type="text"
                                    name="owner_name"
                                    value={formData.owner_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Property owner name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Owner Phone
                                </label>
                                <input
                                    type="tel"
                                    name="owner_phone"
                                    value={formData.owner_phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="+254 700 000 000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creating Property...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Create Property Listing
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}