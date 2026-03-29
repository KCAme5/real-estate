'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { 
    Settings, User, Bell, Lock, CreditCard, MapPin, Phone, Mail, 
    Camera, Save, Loader2, Eye, EyeOff, Building2, Clock, 
    DollarSign, Languages, Award, CheckCircle, AlertCircle, Upload, X
} from 'lucide-react';
import Image from 'next/image';

type TabId = 'profile' | 'availability' | 'notifications' | 'security' | 'payment';

interface AgentProfile {
    bio: string;
    specialties: string[];
    office_address: string;
    years_of_experience: number;
    languages: string[];
    license_number: string;
    user_avatar?: string;
}

interface Availability {
    available_monday: boolean;
    available_tuesday: boolean;
    available_wednesday: boolean;
    available_thursday: boolean;
    available_friday: boolean;
    available_saturday: boolean;
    available_sunday: boolean;
    start_time: string;
    end_time: string;
}

interface NotificationSettings {
    email_notifications: boolean;
    sms_notifications: boolean;
    new_leads_alert: boolean;
    bookings_alert: boolean;
    weekly_summary: boolean;
    marketing_emails: boolean;
}

interface PaymentSettings {
    mpesa_number: string;
    paypal_email: string;
    bank_account: string;
    bank_name: string;
}

const SPECIALTY_OPTIONS = [
    'Residential', 'Commercial', 'Luxury', 'Investment', 
    'Rental', 'Land', 'New Developments', 'Property Management'
];

const LANGUAGE_OPTIONS = [
    'English', 'Swahili', 'French', 'German', 'Mandarin', 'Arabic', 'Hindi'
];

export default function AgentSettingsPage() {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Active tab state
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    
    // Loading states
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
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
        bio: '',
        specialties: [] as string[],
        office_address: '',
        years_of_experience: 0,
        languages: [] as string[],
        license_number: '',
    });
    
    // Availability form
    const [availabilityForm, setAvailabilityForm] = useState<Availability>({
        available_monday: true,
        available_tuesday: true,
        available_wednesday: true,
        available_thursday: true,
        available_friday: true,
        available_saturday: false,
        available_sunday: false,
        start_time: '09:00',
        end_time: '18:00',
    });
    
    // Notification form
    const [notificationForm, setNotificationForm] = useState<NotificationSettings>({
        email_notifications: true,
        sms_notifications: false,
        new_leads_alert: true,
        bookings_alert: true,
        weekly_summary: true,
        marketing_emails: false,
    });
    
    // Password form
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    
    // Payment form
    const [paymentForm, setPaymentForm] = useState<PaymentSettings>({
        mpesa_number: '',
        paypal_email: '',
        bank_account: '',
        bank_name: '',
    });

    // Initialize form with user data
    useEffect(() => {
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
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileForm(prev => ({
                    ...prev,
                    avatar_preview: e.target?.result as string
                }));
            };
            reader.readAsDataURL(file);
            
            // In production, upload to API
            // const formData = new FormData();
            // formData.append('avatar', file);
            // await agentSettingsAPI.updatePhoto(formData);
            
            showSuccess('Photo updated successfully');
        } catch (error) {
            showError('Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Save profile handler
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            // In production: await agentSettingsAPI.updateProfile(profileForm);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            showSuccess('Profile updated successfully');
            refreshUser?.();
        } catch (error) {
            showError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Save availability handler
    const handleSaveAvailability = async () => {
        setSaving(true);
        try {
            // In production: await agentSettingsAPI.updateAvailability(availabilityForm);
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Availability updated successfully');
        } catch (error) {
            showError('Failed to update availability');
        } finally {
            setSaving(false);
        }
    };

    // Save notifications handler
    const handleSaveNotifications = async () => {
        setSaving(true);
        try {
            // In production: await agentSettingsAPI.updateNotifications(notificationForm);
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Notification preferences saved');
        } catch (error) {
            showError('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    // Change password handler
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
            // In production: await agentSettingsAPI.changePassword({
            //     current_password: passwordForm.current_password,
            //     new_password: passwordForm.new_password,
            // });
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Password changed successfully');
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            showError('Failed to change password. Check your current password.');
        } finally {
            setSaving(false);
        }
    };

    // Save payment details handler
    const handleSavePayment = async () => {
        setSaving(true);
        try {
            // In production: await agentSettingsAPI.updatePaymentMethod(paymentForm);
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Payment details saved');
        } catch (error) {
            showError('Failed to save payment details');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'availability', label: 'Availability', icon: Clock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'payment', label: 'Payment', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <Breadcrumb />
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Settings className="text-emerald-400" size={32} />
                        Settings
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your agent profile and preferences</p>
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
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
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
                                    <User className="text-emerald-400" />
                                    Profile Information
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Update your personal information and agent details</p>
                            </div>

                            {/* Photo Upload */}
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 p-0.5">
                                        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 relative">
                                            {(profileForm as any).avatar_preview || user?.profile_picture ? (
                                                <Image
                                                    src={(profileForm as any).avatar_preview || user?.profile_picture || ''}
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
                                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 transition-colors"
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

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.first_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.last_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Mail size={14} /> Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Phone size={14} /> Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone_number}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</label>
                                <textarea
                                    value={profileForm.bio}
                                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                    rows={4}
                                    placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white resize-none"
                                />
                            </div>

                            {/* Office Address */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin size={14} /> Office Address
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.office_address}
                                    onChange={(e) => setProfileForm({ ...profileForm, office_address: e.target.value })}
                                    placeholder="Enter your office address"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                />
                            </div>

                            {/* Specialties */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Building2 size={14} /> Specialties
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SPECIALTY_OPTIONS.map((specialty) => (
                                        <button
                                            key={specialty}
                                            type="button"
                                            onClick={() => {
                                                const newSpecialties = profileForm.specialties.includes(specialty)
                                                    ? profileForm.specialties.filter(s => s !== specialty)
                                                    : [...profileForm.specialties, specialty];
                                                setProfileForm({ ...profileForm, specialties: newSpecialties });
                                            }}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                profileForm.specialties.includes(specialty)
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                        >
                                            {specialty}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Experience & Languages */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Award size={14} /> Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={profileForm.years_of_experience}
                                        onChange={(e) => setProfileForm({ ...profileForm, years_of_experience: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Languages size={14} /> License Number
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.license_number}
                                        onChange={(e) => setProfileForm({ ...profileForm, license_number: e.target.value })}
                                        placeholder="Your real estate license number"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Languages size={14} /> Languages
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGE_OPTIONS.map((language) => (
                                        <button
                                            key={language}
                                            type="button"
                                            onClick={() => {
                                                const newLanguages = profileForm.languages.includes(language)
                                                    ? profileForm.languages.filter(l => l !== language)
                                                    : [...profileForm.languages, language];
                                                setProfileForm({ ...profileForm, languages: newLanguages });
                                            }}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                profileForm.languages.includes(language)
                                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                        >
                                            {language}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
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
                        </div>
                    )}

                    {/* Availability Tab */}
                    {activeTab === 'availability' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Clock className="text-emerald-400" />
                                    Availability Settings
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Set your working hours and days</p>
                            </div>

                            {/* Working Days */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Working Days</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { key: 'available_monday', label: 'Monday' },
                                        { key: 'available_tuesday', label: 'Tuesday' },
                                        { key: 'available_wednesday', label: 'Wednesday' },
                                        { key: 'available_thursday', label: 'Thursday' },
                                        { key: 'available_friday', label: 'Friday' },
                                        { key: 'available_saturday', label: 'Saturday' },
                                        { key: 'available_sunday', label: 'Sunday' },
                                    ].map((day) => (
                                        <button
                                            key={day.key}
                                            type="button"
                                            onClick={() => setAvailabilityForm({
                                                ...availabilityForm,
                                                [day.key]: !availabilityForm[day.key as keyof Availability]
                                            })}
                                            className={`p-4 rounded-xl text-sm font-medium transition-all ${
                                                availabilityForm[day.key as keyof Availability]
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'bg-slate-800 text-slate-400'
                                            }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Time</label>
                                    <input
                                        type="time"
                                        value={availabilityForm.start_time}
                                        onChange={(e) => setAvailabilityForm({ ...availabilityForm, start_time: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Time</label>
                                    <input
                                        type="time"
                                        value={availabilityForm.end_time}
                                        onChange={(e) => setAvailabilityForm({ ...availabilityForm, end_time: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveAvailability}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Availability
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
                                    <Bell className="text-emerald-400" />
                                    Notification Preferences
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Choose how you want to be notified</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                                    { key: 'sms_notifications', label: 'SMS Notifications', description: 'Receive notifications via text message' },
                                    { key: 'new_leads_alert', label: 'New Leads Alert', description: 'Get notified when you receive new leads' },
                                    { key: 'bookings_alert', label: 'Booking Alerts', description: 'Get notified about new property viewings' },
                                    { key: 'weekly_summary', label: 'Weekly Summary', description: 'Receive weekly performance reports' },
                                    { key: 'marketing_emails', label: 'Marketing Emails', description: 'Receive tips and feature updates' },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl"
                                    >
                                        <div>
                                            <p className="font-medium text-white">{item.label}</p>
                                            <p className="text-sm text-slate-400">{item.description}</p>
                                        </div>
                                        <label className="relative inline-block w-14 h-7 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notificationForm[item.key as keyof NotificationSettings]}
                                                onChange={(e) => setNotificationForm({
                                                    ...notificationForm,
                                                    [item.key]: e.target.checked
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-7 bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                                            <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSaveNotifications}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
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

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Lock className="text-emerald-400" />
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
                                            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
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
                                            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
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
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordForm.confirm_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
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
                                disabled={saving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                        </div>
                    )}

                    {/* Payment Tab */}
                    {activeTab === 'payment' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <CreditCard className="text-emerald-400" />
                                    Payment Settings
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Manage your payment methods and bank details</p>
                            </div>

                            {/* M-Pesa */}
                            <div className="space-y-4 p-6 bg-slate-800/30 rounded-2xl">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Phone className="text-emerald-400" size={20} />
                                    M-Pesa
                                </h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">M-Pesa Phone Number</label>
                                    <input
                                        type="tel"
                                        value={paymentForm.mpesa_number}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, mpesa_number: e.target.value })}
                                        placeholder="e.g., 254712345678"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>

                            {/* PayPal */}
                            <div className="space-y-4 p-6 bg-slate-800/30 rounded-2xl">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Mail className="text-teal-400" size={20} />
                                    PayPal
                                </h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">PayPal Email</label>
                                    <input
                                        type="email"
                                        value={paymentForm.paypal_email}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paypal_email: e.target.value })}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="space-y-4 p-6 bg-slate-800/30 rounded-2xl">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Building2 className="text-cyan-400" size={20} />
                                    Bank Account
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Name</label>
                                        <input
                                            type="text"
                                            value={paymentForm.bank_name}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, bank_name: e.target.value })}
                                            placeholder="e.g., Kenya Commercial Bank"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Number</label>
                                        <input
                                            type="text"
                                            value={paymentForm.bank_account}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, bank_account: e.target.value })}
                                            placeholder="Your account number"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSavePayment}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Payment Details
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
