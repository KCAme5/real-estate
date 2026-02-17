'use client';

import React from 'react';
import { User as UserIcon, Home, MessageSquare, Camera, Edit3, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Conversation } from '@/lib/api/leads';

interface WhatsAppSidebarProps {
    conversations: Conversation[];
    activeConversation: Conversation | null;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSelectConversation: (conversation: Conversation) => void;
    onDeleteConversation: (conversationId: number) => void;
    user: any;
    colors: any;
    isVisible: boolean;
}

const WhatsAppSidebar: React.FC<WhatsAppSidebarProps> = ({
    conversations,
    activeConversation,
    searchQuery,
    setSearchQuery,
    onSelectConversation,
    onDeleteConversation,
    user,
    colors,
    isVisible
}) => {
    // Format date helper
    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className={`w-full md:w-96 lg:w-1/3 flex flex-col ${isVisible ? 'flex' : 'hidden md:flex'} h-screen`} style={{ backgroundColor: colors.DARK_GRAY }}>
            {/* Sidebar Header */}
            <div className="p-3 sm:p-4" style={{ backgroundColor: colors.DARK_GRAY, borderBottom: `1px solid ${colors.MEDIUM_GRAY}` }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <UserIcon size={16} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-semibold text-sm sm:text-base">Kenyaprime</h1>
                            <p className="text-xs text-gray-400">Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full transition-colors">
                            <Camera size={16} className="text-gray-300" />
                        </button>
                        <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full transition-colors">
                            <Edit3 size={16} className="text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 sm:pl-10 sm:pr-4 sm:py-3 rounded-lg text-xs sm:text-sm text-white placeholder-gray-400 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        style={{ backgroundColor: colors.INPUT_BG }}
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center">
                        <MessageSquare className="text-gray-500 mx-auto mb-4" size={48} />
                        <p className="text-gray-400">No conversations found</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors ${activeConversation?.id === conv.id ? 'bg-gray-700' : ''}`}
                            onClick={() => onSelectConversation(conv)}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                                    {conv.other_user.avatar ? (
                                        <img src={conv.other_user.avatar} alt={conv.other_user.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <UserIcon size={20} className="text-white" />
                                    )}
                                </div>
                                {conv.unread_count > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {conv.unread_count}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-white font-medium truncate">{conv.other_user.name}</h3>
                                    <span className="text-xs text-gray-400">
                                        {formatMessageTime(conv.updated_at)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-green-400">
                                        {conv.property_title || 'General Inquiry'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 truncate">
                                    {conv.last_message?.content || 'Started a conversation'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Conversation Button */}
            {activeConversation && (
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={() => onDeleteConversation(activeConversation.id)}
                        className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                        <span className="font-medium">Delete Conversation</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default WhatsAppSidebar;
