'use client';

import React from 'react';
import {
    Send,
    User as UserIcon,
    CheckCircle2,
    ArrowLeft,
    MoreVertical,
    Paperclip,
    Smile,
    Edit3,
    Trash2,
    Reply,
    Copy,
    Phone,
    Video,
    Mic,
    X
} from 'lucide-react';
import { Message, Conversation } from '@/lib/api/leads';

interface WhatsAppChatAreaProps {
    activeConversation: Conversation | null;
    messages: Message[];
    newMessage: string;
    setNewMessage: (message: string) => void;
    sending: boolean;
    selectedMessage: number | null;
    setSelectedMessage: (id: number | null) => void;
    replyingTo: Message | null;
    setReplyingTo: (message: Message | null) => void;
    editingMessage: number | null;
    setEditingMessage: (id: number | null) => void;
    editText: string;
    setEditText: (text: string) => void;
    typingUsers: Map<number, string>;
    showChatInfo: boolean;
    setShowChatInfo: (show: boolean) => void;
    onSendMessage: (e: React.FormEvent) => void;
    onDeleteMessage: (messageId: number) => void;
    onReply: (message: Message) => void;
    onCopy: (content: string) => void;
    onEdit: (message: Message) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onTypingStart: () => void;
    onTypingStop: () => void;
    onCloseChat: () => void;
    user: any;
    inputRef: React.RefObject<HTMLInputElement | null>;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    colors: any;
}

const WhatsAppChatArea: React.FC<WhatsAppChatAreaProps> = ({
    activeConversation,
    messages,
    newMessage,
    setNewMessage,
    sending,
    selectedMessage,
    setSelectedMessage,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    editText,
    setEditText,
    typingUsers,
    showChatInfo,
    setShowChatInfo,
    onSendMessage,
    onDeleteMessage,
    onReply,
    onCopy,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onTypingStart,
    onTypingStop,
    onCloseChat,
    user,
    inputRef,
    messagesEndRef,
    colors
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
        <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`} style={{ backgroundColor: colors.BACKGROUND }}>
            {activeConversation ? (
                <>
                    {/* Chat Header */}
                    <div className="p-4 flex items-center justify-between" style={{ backgroundColor: colors.DARK_GRAY, borderBottom: `1px solid ${colors.MEDIUM_GRAY}` }}>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onCloseChat}
                                className="md:hidden p-2 hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-300" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <UserIcon size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">{activeConversation.other_user.name}</h3>
                                <p className="text-xs text-green-400">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                                <Video size={20} className="text-gray-300" />
                            </button>
                            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                                <Phone size={20} className="text-gray-300" />
                            </button>
                            <button
                                onClick={() => setShowChatInfo(!showChatInfo)}
                                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <MoreVertical size={20} className="text-gray-300" />
                            </button>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-2"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2325D366' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                            backgroundColor: colors.CHAT_BG
                        }}
                    >
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender === user?.id;
                            const isSelected = selectedMessage === msg.id;
                            const isEditing = editingMessage === msg.id;

                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                    <div className={`max-w-[70%] relative`}>
                                        {/* Message Actions Dropdown */}
                                        <div className={`absolute ${isMe ? '-left-8' : '-right-8'} top-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMessage(isSelected ? null : msg.id);
                                                }}
                                                className="p-1.5 text-gray-600 hover:bg-gray-300 rounded-full transition-colors"
                                                title="More options"
                                            >
                                                <MoreVertical size={14} />
                                            </button>

                                            {isSelected && (
                                                <div className={`absolute ${isMe ? 'right-0' : 'left-0'} top-8 bg-white rounded-lg shadow-xl py-1 min-w-[140px] z-10 border border-gray-200`}>
                                                    {isMe && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(msg);
                                                            }}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <Edit3 size={14} />
                                                            Edit
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onReply(msg);
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <Reply size={14} />
                                                        Reply
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onCopy(msg.content);
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <Copy size={14} />
                                                        Copy
                                                    </button>
                                                    {isMe && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteMessage(msg.id);
                                                            }}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-green-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'}`}>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                onSaveEdit();
                                                            } else if (e.key === 'Escape') {
                                                                onCancelEdit();
                                                            }
                                                        }}
                                                        className="bg-transparent border-none outline-none flex-1 text-white placeholder-gray-200"
                                                        placeholder="Edit message..."
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={onSaveEdit}
                                                        className="text-white hover:bg-green-600 rounded-full p-1"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={onCancelEdit}
                                                        className="text-white hover:bg-green-600 rounded-full p-1"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>

                                        {/* Message Info */}
                                        <div className={`flex items-center gap-1 px-2 py-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <span className="text-xs text-gray-500">
                                                {formatMessageTime(msg.created_at)}
                                            </span>
                                            {isMe && (
                                                <CheckCircle2 size={14} className={msg.is_read ? 'text-blue-500' : 'text-gray-400'} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {typingUsers.has(activeConversation?.id || 0) && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4" style={{ backgroundColor: colors.DARK_GRAY, borderTop: `1px solid ${colors.MEDIUM_GRAY}` }}>
                        {/* Reply Indicator */}
                        {replyingTo && (
                            <div className="mb-3 p-3 bg-gray-700 rounded-lg border-l-4 border-green-500">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-green-400">
                                        Replying to {replyingTo.sender_name}
                                    </span>
                                    <button
                                        onClick={() => setReplyingTo(null)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-300 truncate">{replyingTo.content}</p>
                            </div>
                        )}

                        <form onSubmit={onSendMessage} className="flex items-center gap-2">
                            <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                                <Smile size={24} />
                            </button>
                            <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                                <Paperclip size={24} />
                            </button>
                            <input
                                ref={inputRef}
                                value={editingMessage ? editText : newMessage}
                                onChange={(e) => {
                                    if (editingMessage) {
                                        setEditText(e.target.value);
                                    } else {
                                        setNewMessage(e.target.value);
                                    }
                                    if (e.target.value.trim()) {
                                        onTypingStart();
                                    } else {
                                        onTypingStop();
                                    }
                                }}
                                onBlur={onTypingStop}
                                placeholder={editingMessage ? "Edit message..." : "Type a message"}
                                className="flex-1 px-4 py-2 rounded-full text-white placeholder-gray-400 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {editingMessage ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={onSaveEdit}
                                        className="p-2 text-green-500 hover:bg-green-600 rounded-full transition-colors"
                                    >
                                        <CheckCircle2 size={24} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onCancelEdit}
                                        className="p-2 text-red-500 hover:bg-red-600 rounded-full transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                                        <Mic size={24} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={24} />
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: colors.BACKGROUND }}>
                    <div className="text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="text-white" size={64} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">WhatsApp Web</h2>
                        <p className="text-gray-400 mb-6">Send and receive messages without keeping your phone online.</p>
                        <p className="text-gray-500 text-sm">Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppChatArea;
