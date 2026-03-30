'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { 
    Settings, User, Bell, Lock, Eye, MapPin, Heart, 
    Camera, Save, Loader2, EyeOff, Trash2, Download, Search,
    CheckCircle, AlertCircle, X, Bed, Bath, Home
} from 'lucide-react';
import Image from 'next/image';
import { userAccountAPI } from '@/lib/api/settings';

type TabId = 'profile' | 'preferences' | 'notifications' | 'security' | 'saved';

interface SavedSearch {
    id: number;
    name: string;
    location: string;
    price_min: number;
    price_max: number;
    property_type: string;
    bedrooms: string;
    created_at: string;
}

export default function ClientSettingsPage() {
    const { user, refreshUser, updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Active tab state
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    
    // Loading states
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Password visibility
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Profile form
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        avatar_preview: null as string | null,
    });
    
    // Preferences form
    const [preferencesForm, setPreferencesForm] = useState({
        locations: [] as string[],
        price_min: 0,
        price_max: 10000000,
        bedrooms: [] as string[],
        property_types: [] as string[],
    });
    
    // Notifications form
    const [notificationsForm, setNotificationsForm] = useState({
        email_notifications: true,
        sms_notifications: false,
        new_listings_alert: true,
        price_drop_alert: true,
        marketing_emails: false,
    });
    
    // Password form
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    
    // Saved searches
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
        { id: 1, name: 'Westlands Apartments', location: 'Westlands', price_min: 5000000, price_max: 10000000, property_type: 'Apartment', bedrooms: '2', created_at: '2024-03-20' },
        { id: 2, name: 'Kilimani Family Home', location: 'Kilimani', price_min: 10000000, price_max: 20000000, property_type: 'House', bedrooms: '4', created_at: '2024-03-15' },
    ]);

    const LOCATIONS = ['Westlands', 'Kilimani', 'Karen', 'Parklands', 'Lavington', 'Riverside', ' Kileleshwa', 'Hurlingham', 'Kilimani'];
    const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Commercial'];
    const BEDROOM_OPTIONS = ['Studio', '1', '2', '3', '4', '5+'];

    // Initialize form with user data
    React.useEffect(() => {
        if (user) {
            setProfileForm(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
            }));
        }
    }, [user]);

    // Show messages
    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const showError = (message: string) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(''), 5000);
    };

    // Photo upload handler
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showError('Photo must be less than 5MB');
            return;
        }
        
        setUploadingPhoto(true);
        try {
            const reader = new FileReader();
            reader.onload = (evt) => {
                setProfileForm(prev => ({
                    ...prev,
                    avatar_preview: evt.target?.result as string
                }));
            };
            reader.readAsDataURL(file);

            const updated = await userAccountAPI.uploadProfilePicture(file);
            // Normalize the profile picture URL before updating
            const normalizedPic = updated.profile_picture
                ? (updated.profile_picture.startsWith('http') || updated.profile_picture.startsWith('data:')
                    ? updated.profile_picture
                    : `${(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')}${updated.profile_picture.startsWith('/') ? '' : '/'}${updated.profile_picture}`)
                : undefined;
            updateUser({ profile_picture: normalizedPic });
            showSuccess('Image uploaded successfully');
        } catch (error: any) {
            console.error('Avatar upload failed:', error);
            showError(error?.message || 'Failed to upload image');
            setProfileForm(prev => ({ ...prev, avatar_preview: null }));
        } finally {
            setUploadingPhoto(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Save profile
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updated = await userAccountAPI.updateMe({
                first_name: profileForm.first_name,
                last_name: profileForm.last_name,
                email: profileForm.email,
                phone_number: profileForm.phone_number,
            });
            updateUser({
                first_name: updated.first_name,
                last_name: updated.last_name,
                email: updated.email,
                phone_number: updated.phone_number,
            });
            showSuccess('Profile updated successfully');
            await refreshUser();
        } catch (error: any) {
            console.error('Profile update failed:', error);
            showError(error?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Save preferences
    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Preferences updated successfully');
        } catch (error) {
            showError('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    // Save notifications
    const handleSaveNotifications = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Notification settings saved');
        } catch (error) {
            showError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            showError('New passwords do not match');
            return;
        }
        
        if (passwordForm.new_password.length < 8) {
            showError('Password must be at least 8 characters');
            return;
        }
        
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Password changed successfully');
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            showError('Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    // Delete saved search
    const handleDeleteSearch = (id: number) => {
        if (confirm('Are you sure you want to delete this saved search?')) {
            setSavedSearches(savedSearches.filter(s => s.id !== id));
            showSuccess('Saved search deleted');
        }
    };

    // Export data
    const handleExportData = () => {
        showSuccess('Data export started. You will receive an email shortly.');
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Eye },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'saved', label: 'Saved Searches', icon: Heart },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <Breadcrumb />
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Settings className="text-blue-400" size={32} />
                        Settings
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your account and preferences</p>
                </div>

                {/* Messages */}
                {successMessage && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                        <CheckCircle size={20} />
                        <span>{successMessage}</span>
                    </div>
                )}
                
                {errorMessage && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                        <AlertCircle size={20} />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
                    <div className="flex overflow-x-auto p-2 gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabId)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 lg:p-8">
                    
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <User className="text-blue-400" />
                                    Profile Information
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Update your personal information</p>
                            </div>

                            {/* Photo Upload */}
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-500 p-0.5">
                                        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 relative">
                                            {profileForm.avatar_preview || user?.profile_picture ? (
                                                <Image
                                                    src={profileForm.avatar_preview || user?.profile_picture || ''}
                                                    alt="Profile"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white">
                                                    {profileForm.first_name?.[0]}{profileForm.last_name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingPhoto}
                                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
                                    >
                                        {uploadingPhoto ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Camera size={18} />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Profile Photo</h3>
                                    <p className="text-sm text-slate-400">Click to upload a new photo</p>
                                    <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.first_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.last_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone_number}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>

                            {/* Danger Zone */}
                            <div className="pt-8 border-t border-slate-800/50">
                                <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
                                <div className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-white">Delete Account</p>
                                        <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
                                    </div>
                                    <button className="px-6 py-3 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Eye className="text-blue-400" />
                                    Search Preferences
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Set your default search preferences</p>
                            </div>

                            {/* Locations */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin size={14} /> Preferred Locations
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {LOCATIONS.map((location) => (
                                        <button
                                            key={location}
                                            onClick={() => {
                                                const newLocations = preferencesForm.locations.includes(location)
                                                    ? preferencesForm.locations.filter(l => l !== location)
                                                    : [...preferencesForm.locations, location];
                                                setPreferencesForm({ ...preferencesForm, locations: newLocations });
                                            }}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                preferencesForm.locations.includes(location)
                                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                        >
                                            {location}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Home size={14} /> Min Price (KES)
                                    </label>
                                    <input
                                        type="number"
                                        value={preferencesForm.price_min}
                                        onChange={(e) => setPreferencesForm({ ...preferencesForm, price_min: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Home size={14} /> Max Price (KES)
                                    </label>
                                    <input
                                        type="number"
                                        value={preferencesForm.price_max}
                                        onChange={(e) => setPreferencesForm({ ...preferencesForm, price_max: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>

                            {/* Property Types */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Types</label>
                                <div className="flex flex-wrap gap-2">
                                    {PROPERTY_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                const newTypes = preferencesForm.property_types.includes(type)
                                                    ? preferencesForm.property_types.filter(t => t !== type)
                                                    : [...preferencesForm.property_types, type];
                                                setPreferencesForm({ ...preferencesForm, property_types: newTypes });
                                            }}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                preferencesForm.property_types.includes(type)
                                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bedrooms */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bedrooms</label>
                                <div className="flex flex-wrap gap-2">
                                    {BEDROOM_OPTIONS.map((bed) => (
                                        <button
                                            key={bed}
                                            onClick={() => {
                                                const newBedrooms = preferencesForm.bedrooms.includes(bed)
                                                    ? preferencesForm.bedrooms.filter(b => b !== bed)
                                                    : [...preferencesForm.bedrooms, bed];
                                                setPreferencesForm({ ...preferencesForm, bedrooms: newBedrooms });
                                            }}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                preferencesForm.bedrooms.includes(bed)
                                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                        >
                                            {bed}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSavePreferences}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Preferences
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Bell className="text-blue-400" />
                                    Notification Settings
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Choose how you want to receive updates</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive updates via email' },
                                    { key: 'sms_notifications', label: 'SMS Notifications', description: 'Receive text message alerts' },
                                    { key: 'new_listings_alert', label: 'New Listings Alert', description: 'Get notified when new properties match your preferences' },
                                    { key: 'price_drop_alert', label: 'Price Drop Alerts', description: 'Be notified when saved properties have price reductions' },
                                    { key: 'marketing_emails', label: 'Marketing Emails', description: 'Receive news about new features and promotions' },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between p-5 bg-slate-800/30 rounded-2xl border border-slate-700/30"
                                    >
                                        <div>
                                            <p className="font-medium text-white">{item.label}</p>
                                            <p className="text-sm text-slate-400">{item.description}</p>
                                        </div>
                                        <label className="relative inline-block w-14 h-7 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notificationsForm[item.key as keyof typeof notificationsForm]}
                                                onChange={(e) => setNotificationsForm({
                                                    ...notificationsForm,
                                                    [item.key]: e.target.checked
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-7 bg-slate-700 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
                                            <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSaveNotifications}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Lock className="text-blue-400" />
                                    Security Settings
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Change your password and secure your account</p>
                            </div>

                            <div className="space-y-6 max-w-lg">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordForm.confirm_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={saving || !passwordForm.current_password || !passwordForm.new_password}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Changing...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Change Password
                                    </>
                                )}
                            </button>

                            {/* Data Export */}
                            <div className="pt-8 border-t border-slate-800/50">
                                <h3 className="text-lg font-bold text-white mb-4">Data & Privacy</h3>
                                <div className="flex items-center justify-between p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-white">Export Your Data</p>
                                        <p className="text-sm text-slate-400">Download a copy of all your data</p>
                                    </div>
                                    <button
                                        onClick={handleExportData}
                                        className="flex items-center gap-2 px-5 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-colors"
                                    >
                                        <Download size={18} />
                                        Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Saved Searches Tab */}
                    {activeTab === 'saved' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Heart className="text-blue-400" />
                                    Saved Searches
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Manage your saved property searches</p>
                            </div>

                            {savedSearches.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Heart size={40} className="text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Saved Searches</h3>
                                    <p className="text-slate-400">Start saving your favorite property searches</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {savedSearches.map((search) => (
                                        <div
                                            key={search.id}
                                            className="flex items-center justify-between p-5 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:border-blue-500/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                                    <Search size={24} className="text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{search.name}</h3>
                                                    <p className="text-sm text-slate-400">
                                                        {search.location} • {search.property_type} • {search.bedrooms} BR
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        KES {search.price_min.toLocaleString()} - KES {search.price_max.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button className="px-4 py-2 bg-blue-500/20 text-blue-400 font-bold rounded-lg hover:bg-blue-500/30 transition-colors">
                                                    Search
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSearch(search.id)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
