'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Bell, Lock, Eye, MapPin, DollarSign } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [preferences, setPreferences] = useState({
        locations: ['Westlands', 'Kilimani'],
        priceRange: ['$300K', '$800K'],
        bedrooms: ['2', '3', '4'],
        notifications: {
            email: true,
            sms: false,
            newListings: true,
            priceDrops: true,
        },
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10 h-full">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Page Header */}
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <Settings className="text-primary" size={36} />
                        Settings
                    </h1>
                    <p className="text-muted-foreground font-medium">Manage your personal information and preferences</p>
                </div>

                {/* Tabs - Premium Styling */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex flex-wrap p-2 gap-2">
                        {[
                            { id: 'profile', icon: Settings, label: 'Profile' },
                            { id: 'preferences', icon: Eye, label: 'Preferences' },
                            { id: 'notifications', icon: Bell, label: 'Notifications' },
                            { id: 'security', icon: Lock, label: 'Security' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                className={`flex-1 min-w-[120px] py-4 px-6 rounded-xl transition-all font-bold flex items-center justify-center gap-2 ${activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content - Premium Implementation */}
                <div className="max-w-4xl">
                    {activeTab === 'profile' && (
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-4xl shadow-inner uppercase font-black text-primary">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-foreground mb-1">Edit Profile</h2>
                                    <p className="text-muted-foreground font-medium">Update your basic information</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-muted/20 border border-border/50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                                        defaultValue={user.first_name}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-muted/20 border border-border/50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                                        defaultValue={user.last_name}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-6 py-4 bg-muted/10 border border-border/20 rounded-2xl font-medium text-muted-foreground cursor-not-allowed"
                                        defaultValue={user.email}
                                        disabled
                                    />
                                </div>
                            </div>
                            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                                Save Profile
                            </button>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                            <h2 className="text-2xl font-black text-foreground">App Preferences</h2>
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={16} className="text-secondary" />
                                        Preferred Locations
                                    </label>
                                    <div className="flex gap-3 flex-wrap">
                                        {['Westlands', 'Kilimani', 'Karen', 'Parklands', 'Lavington', 'Syokimau'].map((location) => (
                                            <button
                                                key={location}
                                                className={`px-5 py-2.5 rounded-xl font-bold transition-all ${preferences.locations.includes(location)
                                                    ? 'bg-secondary text-secondary-foreground shadow-lg'
                                                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                                                    }`}
                                            >
                                                {location}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-secondary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                                    Update Preferences
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                                <Bell className="text-accent" />
                                Notifications
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Email Notifications', key: 'email' },
                                    { label: 'SMS Notifications', key: 'sms' },
                                    { label: 'New Listings Alert', key: 'newListings' },
                                    { label: 'Price Drop Alerts', key: 'priceDrops' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-6 bg-muted/10 rounded-2xl hover:bg-muted/20 transition-colors">
                                        <span className="font-bold text-foreground">{item.label}</span>
                                        <input type="checkbox" className="toggle toggle-primary toggle-lg" defaultChecked={(preferences.notifications as any)[item.key]} />
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/40 transition-all">
                                Save Settings
                            </button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                                <Lock className="text-error" />
                                Security Settings
                            </h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Current Password</label>
                                    <input type="password" className="w-full px-6 py-4 bg-muted/20 border border-border/50 rounded-2xl focus:ring-4 focus:ring-error/10 focus:border-error transition-all outline-none" />
                                </div>
                                <hr className="border-border/50" />
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">New Password</label>
                                    <input type="password" className="w-full px-6 py-4 bg-muted/20 border border-border/50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none" />
                                </div>
                                <button className="px-8 py-4 bg-error text-error-foreground rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-error/40 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
