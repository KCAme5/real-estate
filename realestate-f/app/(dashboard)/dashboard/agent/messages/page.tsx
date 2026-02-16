'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { leadsAPI, Conversation, Message } from '@/lib/api/leads';
import { messagesAPI } from '@/lib/api/messages';
import { useWebSocket, TypingIndicator } from '@/hooks/useWebSocket';
import {
    Send,
    User as UserIcon,
    Home,
    CheckCircle2,
    Search,
    MoreVertical,
    Paperclip,
    Smile,
    MessageSquare,
    Trash2,
    Phone,
    Video,
    FileText,
    Download,
    Calendar,
    Star,
    ExternalLink,
    Clock,
    Zap,
    Plus,
    MoreHorizontal
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

export default function AgentMessagesPage() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const searchParams = useSearchParams();
    const conversationIdParam = searchParams.get('id');
    const recipientId = searchParams.get('recipientId');
    const propertyId = searchParams.get('propertyId');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { sendMessage, subscribe, sendTypingIndicator, markMessagesAsRead } = useWebSocket();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // WebSocket message handler
    useEffect(() => {
        const unsubscribe = subscribe((message) => {
            switch (message.type) {
                case 'message':
                    const messageData = message.data as Message;
                    if (activeConversation && messageData.conversation === activeConversation.id) {
                        setMessages(prev => [...prev, messageData]);
                        setTimeout(scrollToBottom, 100);

                        if (messageData.sender !== user?.id) {
                            markMessagesAsRead(activeConversation.id);
                        }
                    } else {
                        fetchConversations(false);
                    }
                    break;

                case 'typing':
                    const typingData = message.data as TypingIndicator;
                    if (typingData.is_typing) {
                        setTypingUsers(prev => new Map(prev).set(typingData.conversation_id, typingData.user_name));
                    } else {
                        setTypingUsers(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(typingData.conversation_id);
                            return newMap;
                        });
                    }
                    break;

                case 'read_receipt':
                    if (activeConversation && message.data.conversation_id === activeConversation.id) {
                        setMessages(prev => prev.map(msg =>
                            msg.sender === user?.id ? { ...msg, is_read: true } : msg
                        ));
                    }
                    break;
            }
        });

        return unsubscribe;
    }, [activeConversation, user?.id, subscribe, markMessagesAsRead]);

    // Initial fetch and polling
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(() => {
            fetchConversations(false);
            if (activeConversation) {
                fetchMessages(activeConversation.id, false);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activeConversation?.id]);

    const attemptedCreationRef = useRef<string | null>(null);

    // Handle auto-selection
    useEffect(() => {
        const targetId = conversationIdParam ? parseInt(conversationIdParam) : null;
        const targetRecipient = recipientId ? parseInt(recipientId) : null;
        const targetProperty = propertyId ? parseInt(propertyId) : null;

        if (conversations.length > 0) {
            let selected: Conversation | undefined;

            if (targetId && !isNaN(targetId)) {
                selected = conversations.find((c: Conversation) => Number(c.id) === targetId);
            }

            if (!selected && targetRecipient && !isNaN(targetRecipient)) {
                selected = conversations.find((c: Conversation) =>
                    (Number(c.agent) === targetRecipient || Number(c.client) === targetRecipient) &&
                    (!targetProperty || Number(c.property) === targetProperty)
                );
            }

            if (selected) {
                if (!activeConversation || activeConversation.id !== selected.id) {
                    setActiveConversation(selected);
                    fetchMessages(selected.id);
                    setTimeout(() => inputRef.current?.focus(), 300);
                }
                return;
            }
        }

        if (!loading && targetRecipient && !isNaN(targetRecipient)) {
            const creationKey = `${targetRecipient}-${targetProperty}`;
            if (attemptedCreationRef.current === creationKey) return;

            if (!activeConversation) {
                attemptedCreationRef.current = creationKey;
                handleCreateConversation(targetRecipient, targetProperty || undefined);
            }
        }
    }, [conversations, conversationIdParam, recipientId, propertyId, activeConversation?.id, loading]);

    const handleCreateConversation = async (recipientId: number, propertyId?: number) => {
        try {
            setLoading(true);
            const res = await leadsAPI.createConversation(propertyId, recipientId);
            const newConv = res.data || res;

            setConversations(prev => {
                const exists = prev.find(c => c.id === newConv.id);
                if (exists) return prev;
                return [newConv, ...prev];
            });

            setActiveConversation(newConv);
            fetchMessages(newConv.id);
        } catch (error) {
            console.error('Failed to create conversation:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversations = async (showLoading = true) => {
        try {
            if (showLoading && conversations.length === 0) setLoading(true);
            const res = await leadsAPI.getConversations();
            const data = res.results || res;
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: number, showLoading = true) => {
        try {
            const res = await leadsAPI.getMessages(conversationId);
            const data = res.results || res;
            setMessages(data);
            if (showLoading) setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || sending) return;

        try {
            setSending(true);
            const content = newMessage.trim();
            setNewMessage('');

            sendMessage({
                type: 'message',
                conversation_id: activeConversation.id,
                content: content
            });

            await leadsAPI.sendMessage(activeConversation.id, content);
            handleTypingStop();
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
            showError('Failed to send message', 'Please try again');
        } finally {
            setSending(false);
        }
    };

    const handleTypingStart = () => {
        if (!isTyping && activeConversation) {
            setIsTyping(true);
            sendTypingIndicator(activeConversation.id, true);
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(handleTypingStop, 2000);
    };

    const handleTypingStop = () => {
        if (isTyping && activeConversation) {
            setIsTyping(false);
            sendTypingIndicator(activeConversation.id, false);
        }
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter(c =>
            c.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.property_title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSecs < 60) return 'Just now';
        if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
        if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (loading && conversations.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#020617]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
            {/* Column 1: Conversations List */}
            <div className={`w-full md:w-80 lg:w-[320px] border-r border-slate-800/50 flex flex-col bg-[#0B0E14] ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
                        <button className="p-2 bg-slate-800/50 text-blue-400 rounded-xl hover:bg-slate-800 transition-colors">
                            <Zap size={18} fill="currentColor" />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                    {filteredConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => {
                                setActiveConversation(conv);
                                fetchMessages(conv.id);
                            }}
                            className={`w-full px-6 py-5 flex gap-4 border-b border-slate-800/30 transition-all hover:bg-slate-800/30 group relative ${activeConversation?.id === conv.id ? 'bg-blue-600/10' : ''}`}
                        >
                            {activeConversation?.id === conv.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            )}

                            <div className="relative shrink-0">
                                <div className="w-14 h-14 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg">
                                    {conv.property_image ? (
                                        <img src={conv.property_image} alt={conv.other_user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                            <UserIcon className="text-slate-500" size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0B0E14]" />
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-sm text-slate-200 truncate group-hover:text-white transition-colors">
                                        {conv.other_user.name}
                                    </h3>
                                    <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
                                        {conv.last_message ? formatTime(conv.last_message.created_at) : ''}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-400 italic truncate mb-2 leading-relaxed">
                                    "{conv.last_message?.content || 'Started a conversation'}"
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md">
                                        <Home size={10} className="text-blue-400" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 truncate max-w-[100px]">
                                            {conv.property_title || 'General Inquiry'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-red-500/20">HOT</span>
                                        {conv.unread_count > 0 && (
                                            <span className="w-5 h-5 bg-blue-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0B0E14] text-white shadow-lg">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Column 2: Chat View */}
            <div className={`flex-1 flex flex-col bg-[#05070A] ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-8 py-5 border-b border-slate-800/50 flex items-center justify-between bg-[#0B0E14]/50 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 overflow-hidden border border-slate-700/50">
                                        <UserIcon className="text-slate-500 m-3" size={24} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#05070A]" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-white leading-tight">{activeConversation.other_user.name}</h3>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">ACTIVE NOW</span>
                                        <span className="text-slate-700 mx-1">•</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 truncate max-w-[200px]">
                                            INTERESTED IN {activeConversation.property_title}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="p-3 bg-slate-800/30 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all border border-slate-800/50">
                                    <Phone size={18} />
                                </button>
                                <button className="p-3 bg-slate-800/30 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all border border-slate-800/50">
                                    <Video size={18} />
                                </button>
                                <button className="p-3 bg-slate-800/30 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all border border-slate-800/50">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar relative">
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '15px 15px' }} />

                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                            <div className={`relative px-6 py-4 rounded-[1.8rem] text-sm font-medium shadow-2xl ${isMe
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : 'bg-slate-900/80 backdrop-blur-sm border border-slate-800 text-slate-200 rounded-tl-none'
                                                }`}>
                                                {/* Chat Bubble Tail */}
                                                <div className={`absolute top-0 w-4 h-4 ${isMe
                                                        ? 'right-[-8px] text-blue-600'
                                                        : 'left-[-8px] text-slate-900/80'
                                                    }`}>
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d={isMe ? "M0 0 L20 0 L0 20 Z" : "M20 0 L0 0 L20 20 Z"} />
                                                    </svg>
                                                </div>

                                                {msg.content}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 px-1">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <div className="flex">
                                                        <CheckCircle2 size={12} className={msg.is_read ? 'text-blue-400' : 'text-slate-600'} />
                                                        <CheckCircle2 size={12} className={msg.is_read ? 'text-blue-400' : 'text-slate-600'} style={{ marginLeft: '-6px' }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Example Attachment Design */}
                            <div className="flex justify-end group">
                                <div className="flex flex-col items-end max-w-[75%]">
                                    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-[2rem] rounded-tr-none flex items-center gap-4 bg-slate-900/80 backdrop-blur-sm shadow-xl">
                                        <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h4 className="text-sm font-bold text-slate-200 truncate">FloorPlan_Westlands_B4.pdf</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">PDF DOCUMENT • 2.4 MB</p>
                                        </div>
                                        <button className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 px-1">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">11:05 AM</span>
                                        <div className="flex">
                                            <CheckCircle2 size={12} className="text-blue-400" />
                                            <CheckCircle2 size={12} className="text-blue-400" style={{ marginLeft: '-6px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions & Input */}
                        <div className="p-8 bg-[#0B0E14] border-t border-slate-800/50 space-y-6">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'SCHEDULE VIEWING', 'SEND BROCHURE', 'ASK FOR PHONE', 'PRICING DETAILS'
                                ].map(action => (
                                    <button
                                        key={action}
                                        className="px-5 py-2.5 bg-slate-800/40 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 text-[10px] font-black tracking-widest text-slate-400 hover:text-white rounded-xl transition-all"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} className="flex items-center gap-4 group">
                                <div className="flex-1 flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] px-6 py-2 focus-within:ring-2 ring-blue-500/20 transition-all">
                                    <button type="button" className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        ref={inputRef}
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTypingStart();
                                        }}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent border-none outline-none py-4 text-sm font-medium text-white placeholder:text-slate-600"
                                    />
                                    <button type="button" className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
                                        <Smile size={20} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    <Send size={24} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8">
                        <div className="w-32 h-32 bg-slate-900/50 rounded-[4rem] flex items-center justify-center border border-slate-800 relative">
                            <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full" />
                            <MessageSquare className="text-blue-500 opacity-40 relative z-10" size={48} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-white tracking-tight">Agent Communications</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                                Select a conversation to start managing your leads and closing more deals through our premium messaging suite.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Column 3: Lead Info Section */}
            {activeConversation && (
                <div className="hidden lg:flex w-[340px] border-l border-slate-800/50 flex flex-col bg-[#0B0E14] p-8 overflow-y-auto no-scrollbar pb-20">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 overflow-hidden border-2 border-slate-800 shadow-2xl p-1">
                                {activeConversation.property_image ? (
                                    <img src={activeConversation.property_image} className="w-full h-full object-cover rounded-[2.2rem]" />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center rounded-[2.2rem]">
                                        <UserIcon className="text-slate-700" size={48} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0B0E14] rounded-2xl p-1 border border-slate-800">
                                <div className="w-full h-full bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <Star size={18} fill="white" className="text-white" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">{activeConversation.other_user.name}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">VIP PREMIUM LEAD</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">LEAD SCORE</p>
                                <p className="text-xl font-black text-blue-400">92%</p>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">INQUIRIES</p>
                                <p className="text-xl font-black text-white">4</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 space-y-8">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Home size={16} className="text-blue-400" />
                                <h4 className="text-[10px] font-black uppercase tracking-[.25em] text-slate-500">PRIMARY INTEREST</h4>
                            </div>

                            <Link href={`/properties/${activeConversation.property}`} className="block group">
                                <div className="relative h-48 rounded-[2rem] overflow-hidden border border-slate-800">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent z-10" />
                                    {activeConversation.property_image ? (
                                        <img src={activeConversation.property_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-900" />
                                    )}
                                    <div className="absolute bottom-6 inset-x-6 z-20 space-y-1">
                                        <p className="text-xs font-bold text-white truncate">{activeConversation.property_title}</p>
                                        <p className="text-[10px] font-black text-blue-400 tracking-widest">
                                            $120,000
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[.25em] text-slate-500">LEAD ACTIONS</h4>
                            <div className="space-y-3">
                                {[
                                    { icon: Calendar, label: 'Schedule Tour', color: 'blue' },
                                    { icon: FileText, label: 'Add Internal Note', color: 'slate' },
                                    { icon: Clock, label: 'Mark as Dormant', color: 'red' }
                                ].map((action, i) => (
                                    <button
                                        key={i}
                                        className="w-full flex items-center gap-4 p-4 bg-slate-900/30 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all group"
                                    >
                                        <div className={`p-2 rounded-xl bg-${action.color}-500/10 text-${action.color}-400 group-hover:bg-${action.color}-500/20 group-hover:scale-110 transition-all`}>
                                            <action.icon size={18} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}

import { Suspense } from 'react';

export default function AgentMessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        }>
            <AgentMessagesContent />
        </Suspense>
    );
}