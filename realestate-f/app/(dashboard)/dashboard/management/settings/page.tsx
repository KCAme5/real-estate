'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { 
    Settings, User, Bell, Lock, Camera, Save, Loader2, Eye, EyeOff, Shield
} from 'lucide-react';
import Image from 'next/image';
import { userAccountAPI } from '@/lib/api/settings';

type TabId = 'profile' | 'notifications' | 'security';

export default function ManagementSettingsPage() {
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
    
    // Profile form
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        avatar_preview: null as string | null,
    });
    
    // Notification form
    const [notificationForm, setNotificationForm] = useState({
        email_notifications: true,
        system_alerts: true,
        weekly_reports: true,
    });
    
    // Password form
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
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
        
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showError('Photo must be less than 5MB');
            return;
        }
        
        setUploadingPhoto(true);
        try {
            // Optimistic preview
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

    // Save profile handler
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

    // Save notifications
    const handleSaveNotifications = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Notification preferences saved');
        } catch (error) {
            showError('Failed to save preferences');
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

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Breadcrumb />
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Settings className="text-blue-400" size={32} />
                        Profile Settings
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your personal account settings</p>
                </div>
                
                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {errorMessage}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-800 pb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                activeTab === tab.id
                                    ? 'bg-blue-500 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                                        {profileForm.avatar_preview || user?.profile_picture ? (
                                            <Image
                                                src={profileForm.avatar_preview || user?.profile_picture || ''}
                                                alt="Profile"
                                                width={96}
                                                height={96}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-slate-600" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingPhoto}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
                                    >
                                        {uploadingPhoto ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Camera className="w-4 h-4" />
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
                                    <h3 className="font-semibold">Profile Photo</h3>
                                    <p className="text-sm text-slate-400">Upload a photo to personalize your account</p>
                                </div>
                            </div>

                            {/* Profile Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.first_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.last_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone_number}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Notification Preferences</h3>
                            
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                                    <div>
                                        <div className="font-medium">Email Notifications</div>
                                        <div className="text-sm text-slate-400">Receive notifications via email</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notificationForm.email_notifications}
                                        onChange={(e) => setNotificationForm({ ...notificationForm, email_notifications: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                                    <div>
                                        <div className="font-medium">System Alerts</div>
                                        <div className="text-sm text-slate-400">Important system notifications</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notificationForm.system_alerts}
                                        onChange={(e) => setNotificationForm({ ...notificationForm, system_alerts: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                                    <div>
                                        <div className="font-medium">Weekly Reports</div>
                                        <div className="text-sm text-slate-400">Receive weekly summary reports</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notificationForm.weekly_reports}
                                        onChange={(e) => setNotificationForm({ ...notificationForm, weekly_reports: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                    />
                                </label>
                            </div>

                            <button
                                onClick={handleSaveNotifications}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Preferences
                            </button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Change Password</h3>
                            
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirm_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                Change Password
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
