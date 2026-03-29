'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import { 
    Settings, User, Bell, Lock, Building2, Users, CreditCard, 
    Camera, Save, Loader2, Eye, EyeOff, Globe, Shield, 
    Plus, X, Trash2, Mail, CheckCircle, AlertCircle, Crown
} from 'lucide-react';
import Image from 'next/image';

type TabId = 'organization' | 'team' | 'notifications' | 'security' | 'billing';

interface OrganizationSettings {
    company_name: string;
    description: string;
    website: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
}

interface TeamMember {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'admin' | 'manager' | 'analyst';
    status: 'active' | 'pending' | 'inactive';
    joined_at: string;
}

interface AuditLogEntry {
    id: number;
    action: string;
    user: string;
    timestamp: string;
    details: string;
}

const ROLE_LABELS = {
    admin: { label: 'Admin', color: 'bg-red-500/20 text-red-400' },
    manager: { label: 'Manager', color: 'bg-amber-500/20 text-amber-400' },
    analyst: { label: 'Analyst', color: 'bg-blue-500/20 text-blue-400' },
};

export default function ManagementSettingsPage() {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Active tab state
    const [activeTab, setActiveTab] = useState<TabId>('organization');
    
    // Loading states
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Password visibility
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    
    // Organization form
    const [orgForm, setOrgForm] = useState<OrganizationSettings>({
        company_name: '',
        description: '',
        website: '',
        address: '',
        phone: '',
        email: '',
    });
    
    // Team state
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'admin', status: 'active', joined_at: '2024-01-15' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', role: 'manager', status: 'active', joined_at: '2024-02-20' },
        { id: 3, first_name: 'Bob', last_name: 'Wilson', email: 'bob@example.com', role: 'analyst', status: 'pending', joined_at: '2024-03-10' },
    ]);
    
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: 'manager' as 'admin' | 'manager' | 'analyst',
    });
    
    // Notification form
    const [notificationForm, setNotificationForm] = useState({
        email_notifications: true,
        system_alerts: true,
        weekly_reports: true,
        team_activity: false,
    });
    
    // Password form
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    
    // Billing form
    const [billingForm, setBillingForm] = useState({
        billing_email: '',
        billing_address: '',
        payment_method: 'bank_transfer',
        tax_id: '',
    });

    // Audit log
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
        { id: 1, action: 'User Updated', user: 'admin@kenyaprime.co.ke', timestamp: '2024-03-29 10:30 AM', details: 'Updated agent commission rates' },
        { id: 2, action: 'Team Member Added', user: 'admin@kenyaprime.co.ke', timestamp: '2024-03-28 02:15 PM', details: 'Added Jane Smith as Manager' },
        { id: 3, action: 'Settings Changed', user: 'admin@kenyaprime.co.ke', timestamp: '2024-03-27 09:00 AM', details: 'Modified notification preferences' },
    ]);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setOrgForm(prev => ({
                ...prev,
                company_name: user.first_name ? `${user.first_name}'s Organization` : 'KenyaPrime Management',
                email: user.email || '',
                phone: user.phone_number || '',
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

    // Logo upload handler
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showError('Logo must be less than 5MB');
            return;
        }
        
        setUploadingLogo(true);
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                setOrgForm(prev => ({
                    ...prev,
                    logo_preview: e.target?.result as string
                }));
            };
            reader.readAsDataURL(file);
            
            showSuccess('Logo updated successfully');
        } catch (error) {
            showError('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    // Save organization settings
    const handleSaveOrganization = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Organization settings saved');
        } catch (error) {
            showError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Invite team member
    const handleInviteMember = async () => {
        if (!inviteForm.email || !inviteForm.role) {
            showError('Please fill in all required fields');
            return;
        }
        
        setSaving(true);
        try {
            const newMember: TeamMember = {
                id: Date.now(),
                first_name: inviteForm.first_name,
                last_name: inviteForm.last_name,
                email: inviteForm.email,
                role: inviteForm.role,
                status: 'pending',
                joined_at: new Date().toISOString().split('T')[0],
            };
            setTeamMembers([...teamMembers, newMember]);
            setInviteForm({ first_name: '', last_name: '', email: '', role: 'manager' });
            setShowInviteModal(false);
            showSuccess('Invitation sent successfully');
        } catch (error) {
            showError('Failed to send invitation');
        } finally {
            setSaving(false);
        }
    };

    // Remove team member
    const handleRemoveMember = (id: number) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            setTeamMembers(teamMembers.filter(m => m.id !== id));
            showSuccess('Team member removed');
        }
    };

    // Change role
    const handleChangeRole = (id: number, newRole: 'admin' | 'manager' | 'analyst') => {
        setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, role: newRole } : m));
        showSuccess('Role updated successfully');
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

    // Save billing settings
    const handleSaveBilling = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Billing settings saved');
        } catch (error) {
            showError('Failed to save billing settings');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'organization', label: 'Organization', icon: Building2 },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <Breadcrumb />
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Settings className="text-blue-400" size={32} />
                        Management Settings
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your organization and team settings</p>
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
                    
                    {/* Organization Tab */}
                    {activeTab === 'organization' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Building2 className="text-blue-400" />
                                    Organization Details
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Manage your organization information</p>
                            </div>

                            {/* Logo Upload */}
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-500 p-0.5">
                                        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 relative flex items-center justify-center">
                                            {(orgForm as any).logo_preview ? (
                                                <Image
                                                    src={(orgForm as any).logo_preview}
                                                    alt="Organization Logo"
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            ) : orgForm.logo ? (
                                                <Image
                                                    src={orgForm.logo}
                                                    alt="Organization Logo"
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <Building2 size={40} className="text-slate-500" />
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
                                    >
                                        {uploadingLogo ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Camera size={18} />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Company Logo</h3>
                                    <p className="text-sm text-slate-400">Click to upload your logo</p>
                                    <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                                </div>
                            </div>

                            {/* Organization Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                                    <input
                                        type="text"
                                        value={orgForm.company_name}
                                        onChange={(e) => setOrgForm({ ...orgForm, company_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Globe size={14} /> Website
                                    </label>
                                    <input
                                        type="url"
                                        value={orgForm.website}
                                        onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                                        placeholder="https://example.com"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Mail size={14} /> Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={orgForm.email}
                                        onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={orgForm.phone}
                                        onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
                                    <input
                                        type="text"
                                        value={orgForm.address}
                                        onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                                        placeholder="Enter your organization address"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={orgForm.description}
                                        onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                                        rows={4}
                                        placeholder="Brief description of your organization"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveOrganization}
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
                        </div>
                    )}

                    {/* Team Tab */}
                    {activeTab === 'team' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Users className="text-blue-400" />
                                        Team Management
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">Manage your team members and their roles</p>
                                </div>
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    <Plus size={18} />
                                    Invite Member
                                </button>
                            </div>

                            {/* Team List */}
                            <div className="space-y-4">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-5 bg-slate-800/30 rounded-2xl border border-slate-700/30"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-lg font-black text-white">
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white">{member.first_name} {member.last_name}</h3>
                                                    {member.role === 'admin' && (
                                                        <Crown size={16} className="text-amber-400" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleChangeRole(member.id, e.target.value as any)}
                                                className="px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-white outline-none cursor-pointer"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="manager">Manager</option>
                                                <option value="analyst">Analyst</option>
                                            </select>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                                member.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-slate-500/20 text-slate-400'
                                            }`}>
                                                {member.status}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Audit Log */}
                            <div className="space-y-4 pt-8 border-t border-slate-800/50">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Shield size={18} className="text-blue-400" />
                                    Activity Log
                                </h3>
                                <div className="space-y-3">
                                    {auditLog.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/20"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-white">{entry.action}</span>
                                                <span className="text-xs text-slate-500">{entry.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-slate-400">{entry.details}</p>
                                            <p className="text-xs text-slate-500 mt-1">by {entry.user}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Invite Modal */}
                            {showInviteModal && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-white">Invite Team Member</h3>
                                            <button
                                                onClick={() => setShowInviteModal(false)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase">First Name</label>
                                                <input
                                                    type="text"
                                                    value={inviteForm.first_name}
                                                    onChange={(e) => setInviteForm({ ...inviteForm, first_name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={inviteForm.last_name}
                                                    onChange={(e) => setInviteForm({ ...inviteForm, last_name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                            <input
                                                type="email"
                                                value={inviteForm.email}
                                                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
                                            <select
                                                value={inviteForm.role}
                                                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white outline-none cursor-pointer"
                                            >
                                                <option value="manager">Manager</option>
                                                <option value="analyst">Analyst</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={handleInviteMember}
                                            disabled={saving}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Mail size={18} />
                                                    Send Invitation
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Bell className="text-blue-400" />
                                    Notification Preferences
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Configure how you receive notifications</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                                    { key: 'system_alerts', label: 'System Alerts', description: 'Get notified about system events and updates' },
                                    { key: 'weekly_reports', label: 'Weekly Reports', description: 'Receive weekly summary of platform activity' },
                                    { key: 'team_activity', label: 'Team Activity', description: 'Get notified about team member actions' },
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
                                                checked={notificationForm[item.key as keyof typeof notificationForm]}
                                                onChange={(e) => setNotificationForm({
                                                    ...notificationForm,
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
                                    <Lock className="text-blue-400" />
                                    Security Settings
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Manage your account security</p>
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
                                    <input
                                        type="password"
                                        value={passwordForm.confirm_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
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
                        </div>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <CreditCard className="text-blue-400" />
                                    Billing Settings
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Manage your billing information and payment methods</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billing Email</label>
                                    <input
                                        type="email"
                                        value={billingForm.billing_email}
                                        onChange={(e) => setBillingForm({ ...billingForm, billing_email: e.target.value })}
                                        placeholder="billing@company.com"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billing Address</label>
                                    <textarea
                                        value={billingForm.billing_address}
                                        onChange={(e) => setBillingForm({ ...billingForm, billing_address: e.target.value })}
                                        rows={3}
                                        placeholder="Enter your billing address"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method</label>
                                    <select
                                        value={billingForm.payment_method}
                                        onChange={(e) => setBillingForm({ ...billingForm, payment_method: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white outline-none cursor-pointer"
                                    >
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="mpesa">M-Pesa</option>
                                        <option value="paypal">PayPal</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tax ID / VAT Number</label>
                                    <input
                                        type="text"
                                        value={billingForm.tax_id}
                                        onChange={(e) => setBillingForm({ ...billingForm, tax_id: e.target.value })}
                                        placeholder="Enter your tax ID"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveBilling}
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
                                        Save Billing Settings
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