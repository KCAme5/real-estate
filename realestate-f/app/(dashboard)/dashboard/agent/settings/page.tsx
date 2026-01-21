'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { Settings as SettingsIcon, User, Bell, Lock, Mail } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <Breadcrumb />

                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <SettingsIcon className="text-primary" size={32} />
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
                </div>

                {/* Tabs */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex border-b border-border overflow-x-auto">
                        {[
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                            { id: 'security', label: 'Security', icon: Lock },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-6">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-foreground">Profile Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                                        <input
                                            type="text"
                                            defaultValue={user?.first_name || ''}
                                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            defaultValue={user?.last_name || ''}
                                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email || ''}
                                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            defaultValue={user?.phone_number || ''}
                                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                                        <textarea
                                            rows={4}
                                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>

                                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>

                                <div className="space-y-4">
                                    {[
                                        { label: 'Email notifications for new leads', description: 'Receive an email when you get a new lead' },
                                        { label: 'Email notifications for bookings', description: 'Get notified about new property viewings' },
                                        { label: 'Weekly performance summary', description: 'Receive a weekly email with your performance metrics' },
                                        { label: 'Marketing emails', description: 'Receive updates about new features and tips' },
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                                            <div>
                                                <p className="font-medium text-foreground">{item.label}</p>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                            <label className="relative inline-block w-12 h-6">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-12 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary transition-colors"></div>
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                    Save Preferences
                                </button>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-foreground">Security Settings</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                    Change Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
