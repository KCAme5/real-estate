'use client';

import React from 'react';
import { User as UserIcon, Home, X } from 'lucide-react';
import Link from 'next/link';
import { Conversation } from '@/lib/api/leads';

interface WhatsAppChatInfoProps {
    conversation: Conversation;
    onClose: () => void;
    colors: any;
}

const WhatsAppChatInfo: React.FC<WhatsAppChatInfoProps> = ({
    conversation,
    onClose,
    colors
}) => {
    return (
        <div className="hidden lg:flex lg:w-80 flex-col" style={{ backgroundColor: colors.DARK_GRAY, borderLeft: `1px solid ${colors.MEDIUM_GRAY}` }}>
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">Chat Info</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
                    <UserIcon size={48} className="text-white" />
                </div>
                <h3 className="text-white font-medium text-lg mb-1">{conversation.other_user.name}</h3>
                <p className="text-green-400 text-sm mb-4">Online</p>

                {conversation.property && (
                    <div className="bg-gray-700 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-400 mb-1">Property</p>
                        <p className="text-white text-sm">{conversation.property_title}</p>
                        <Link
                            href={`/properties/${conversation.property}`}
                            className="text-green-400 text-xs hover:underline mt-2 inline-block"
                        >
                            View Property →
                        </Link>
                    </div>
                )}

                <div className="space-y-2">
                    <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        Mute Notifications
                    </button>
                    <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        Clear Messages
                    </button>
                    <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        Block User
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppChatInfo;
