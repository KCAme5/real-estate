'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { leadsAPI, Conversation, Message } from '@/lib/api/leads';
import { agentsAPI } from '@/lib/api/agents';
import { Agent } from '@/types/agent';
import { useWebSocket, TypingIndicator } from '@/hooks/useWebSocket';
import {
    Send,
    User as UserIcon,
    CheckCircle2,
    Search,
    MoreHorizontal,
    Paperclip,
    Phone,
    Video,
    Plus,
    X,
    Star,
    Info,
    Trash2
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function MessagesContent() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const conversationIdParam = searchParams?.get('id') ?? null;
    const recipientId = searchParams?.get('recipientId') ?? null;
    const propertyId = searchParams?.get('propertyId') ?? null;

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAgentsList, setShowAgentsList] = useState(false);
    const [verifiedAgents, setVerifiedAgents] = useState<Agent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [messageSearch, setMessageSearch] = useState('');
    const [visibleMessageCount, setVisibleMessageCount] = useState(50);
    const [messageBeingDeleted, setMessageBeingDeleted] = useState<Message | null>(null);
    const [deleting, setDeleting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const attemptedCreationRef = useRef<string | null>(null);
    const {
        sendMessage,
        subscribe,
        sendTypingIndicator,
        markMessagesAsRead,
        connectionState,
        hasWebSocketFailed,
    } = useWebSocket();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (typeof window === 'undefined') return;
        console.log('MessagesContent mounted on client');
    }, [mounted]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch verified agents
    const fetchVerifiedAgents = async () => {
        try {
            setLoadingAgents(true);
            const res = await agentsAPI.getAll();
            const agents = res.results || res;
            setVerifiedAgents(agents.filter((agent: Agent) => agent.is_verified));
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoadingAgents(false);
        }
    };

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

    useEffect(() => {
        fetchConversations();
        fetchVerifiedAgents();
        const interval = setInterval(() => {
            fetchConversations(false);
            if (activeConversation) {
                fetchMessages(activeConversation.id, false);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activeConversation?.id]);

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

    useEffect(() => {
        setMessageSearch('');
    }, [activeConversation?.id]);

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

    const handleStartAgentChat = async (agentId: number) => {
        try {
            setLoading(true);
            setShowAgentsList(false);

            // Check if conversation already exists
            const existingConv = conversations.find(c => Number(c.agent) === agentId);
            if (existingConv) {
                setActiveConversation(existingConv);
                fetchMessages(existingConv.id);
                return;
            }

            // Create new conversation with agent
            const res = await leadsAPI.createAgentConversation(agentId);
            const newConv = res.data || res;

            setConversations(prev => {
                const exists = prev.find(c => c.id === newConv.id);
                if (exists) return prev;
                return [newConv, ...prev];
            });

            setActiveConversation(newConv);
            fetchMessages(newConv.id);
        } catch (error) {
            console.error('Failed to start agent chat:', error);
            showError('Failed to start chat', 'Please try again');
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
            setVisibleMessageCount((prev) => {
                const base = 50;
                const length = Array.isArray(data) ? data.length : 0;
                if (!length) return base;
                if (length < base) return length;
                return prev > length ? length : prev < base ? base : prev;
            });
            if (showLoading) setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            showError('Failed to load messages', 'Please check your connection and try again');
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

    const handleDeleteMessage = async () => {
        if (!activeConversation || !messageBeingDeleted) return;
        try {
            setDeleting(true);
            await leadsAPI.deleteMessage(activeConversation.id, messageBeingDeleted.id);
            setMessages(prev => prev.filter(m => m.id !== messageBeingDeleted.id));
            setMessageBeingDeleted(null);
            fetchConversations(false);
        } catch (error) {
            console.error('Failed to delete message:', error);
            showError('Failed to delete message', 'Please try again');
        } finally {
            setDeleting(false);
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

    const groupedConversations = useMemo(() => {
        const query = searchQuery.toLowerCase();
        type Grouped = {
            userId: number;
            latestConversation: Conversation;
            conversationCount: number;
            totalUnread: number;
        };

        const map = new Map<number, Grouped>();

        conversations.forEach((conv) => {
            const userId = conv.other_user.id;
            const lastTime = conv.last_message?.created_at ?? conv.updated_at;
            const existing = map.get(userId);

            if (!existing) {
                map.set(userId, {
                    userId,
                    latestConversation: conv,
                    conversationCount: 1,
                    totalUnread: conv.unread_count,
                });
            } else {
                const existingTime =
                    existing.latestConversation.last_message?.created_at ??
                    existing.latestConversation.updated_at;

                if (new Date(lastTime).getTime() > new Date(existingTime).getTime()) {
                    existing.latestConversation = conv;
                }

                existing.conversationCount += 1;
                existing.totalUnread += conv.unread_count;
            }
        });

        let groups = Array.from(map.values());

        if (query) {
            groups = groups.filter((g) =>
                g.latestConversation.other_user.name.toLowerCase().includes(query)
            );
        }

        groups.sort((a, b) => {
            const aTime =
                a.latestConversation.last_message?.created_at ??
                a.latestConversation.updated_at;
            const bTime =
                b.latestConversation.last_message?.created_at ??
                b.latestConversation.updated_at;

            return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

        return groups;
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

    const connectionLabel =
        connectionState === 'open'
            ? 'Live chat'
            : hasWebSocketFailed
                ? 'Using fallback (refreshes every few seconds)'
                : connectionState === 'connecting'
                    ? 'Connecting...'
                    : 'Chat offline';

    const connectionClassName =
        connectionState === 'open'
            ? 'text-emerald-400'
            : hasWebSocketFailed
                ? 'text-amber-400'
                : 'text-gray-400';


    const typingText = useMemo(() => {
        if (!activeConversation) return '';
        const name = typingUsers.get(activeConversation.id);
        if (!name) return '';
        return `${name} is typing...`;
    }, [typingUsers, activeConversation?.id]);

    const filteredMessages = useMemo(() => {
        const total = messages.length;
        const start = Math.max(0, total - visibleMessageCount);
        let slice = messages.slice(start);
        if (messageSearch.trim()) {
            const q = messageSearch.toLowerCase();
            slice = slice.filter(m => m.content.toLowerCase().includes(q));
        }
        return slice;
    }, [messages, visibleMessageCount, messageSearch]);

    const canLoadOlder = visibleMessageCount < messages.length;

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0B192F]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (loading && conversations.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0B192F]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-950 text-white overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
            </div>

            {/* Left Sidebar - Chats List */}
            <div className={`relative z-10 w-full md:w-96 border-r border-slate-800/50 flex flex-col bg-slate-950/50 backdrop-blur-3xl transition-all duration-300 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-800/50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                Messages
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">Live</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${connectionState === 'open' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <p className={`text-[10px] uppercase font-bold tracking-[0.1em] ${connectionClassName}`}>
                                    {connectionLabel}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAgentsList(true)}
                            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:scale-105 active:scale-95"
                            title="New Chat"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {groupedConversations.map((group) => {
                        const conv = group.latestConversation;
                        const isActive =
                            activeConversation &&
                            activeConversation.other_user.id === group.userId;

                        return (
                            <button
                                key={group.userId}
                                onClick={() => {
                                    setActiveConversation(conv);
                                    fetchMessages(conv.id);
                                }}
                                className={`w-full px-4 py-4 mb-2 flex gap-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-emerald-600/10 border border-emerald-500/20' : 'hover:bg-slate-900/50 border border-transparent'}`}
                            >
                                <div className="relative shrink-0">
                                    <div className={`w-14 h-14 bg-slate-800 rounded-2xl overflow-hidden border-2 transition-colors duration-300 ${isActive ? 'border-emerald-500' : 'border-slate-800 group-hover:border-slate-700'}`}>
                                        {conv.other_user.avatar ? (
                                            <img src={conv.other_user.avatar} alt={conv.other_user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UserIcon className="text-slate-500" size={24} />
                                            </div>
                                        )}
                                    </div>
                                    {conv.other_user.is_online && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-100 group-hover:text-white'} truncate flex items-center gap-1.5`}>
                                            {conv.other_user.name}
                                            {conv.other_user.is_verified && (
                                                <CheckCircle2 size={14} className="text-blue-400" fill="currentColor" />
                                            )}
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                            {conv.last_message
                                                ? formatTime(conv.last_message.created_at)
                                                : formatTime(conv.updated_at)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <p className={`text-xs truncate ${isActive ? 'text-emerald-100/70' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                            {conv.last_message?.content || 'No messages yet'}
                                        </p>
                                        {group.totalUnread > 0 && (
                                            <span className="shrink-0 w-5 h-5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                {group.totalUnread}
                                            </span>
                                        )}
                                    </div>

                                    {group.conversationCount > 1 && (
                                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {group.conversationCount} Threads
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`relative z-10 flex-1 flex flex-col bg-slate-950/30 backdrop-blur-md ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-8 py-5 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/50 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setActiveConversation(null)}
                                    className="md:hidden p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all"
                                >
                                    <X size={22} />
                                </button>
                                <div className="relative">
                                    <div className="w-12 h-12 bg-slate-800 rounded-2xl overflow-hidden border-2 border-emerald-500/10 active:scale-95 transition-transform cursor-pointer">
                                        {activeConversation.other_user.avatar ? (
                                            <img src={activeConversation.other_user.avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UserIcon className="text-slate-500" size={24} />
                                            </div>
                                        )}
                                    </div>
                                    {activeConversation.other_user.is_online && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-slate-950" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-white tracking-tight truncate">
                                            {activeConversation.other_user.name}
                                        </h3>
                                        {activeConversation.other_user.is_verified && (
                                            <CheckCircle2 size={16} className="text-blue-400" fill="currentColor" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold uppercase tracking-widest">
                                        <span className={activeConversation.other_user.is_online ? 'text-emerald-400' : 'text-slate-500'}>
                                            {activeConversation.other_user.is_online ? '• Online' : '• Offline'}
                                        </span>
                                        {activeConversation.property_title && (
                                            <>
                                                <span className="text-slate-700">/</span>
                                                <span className="text-blue-400 truncate max-w-[200px]">Re: {activeConversation.property_title}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-1.5">
                                <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all" title="Call">
                                    <Phone size={18} />
                                </button>
                                <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all" title="Video Call">
                                    <Video size={18} />
                                </button>
                                <div className="w-px h-6 bg-slate-800 mx-2" />
                                <button className="p-3 text-emerald-400 hover:bg-emerald-500/10 rounded-2xl transition-all" title="Details">
                                    <Info size={18} />
                                </button>
                                <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all" title="Settings">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-6"
                        >
                            {filteredMessages.length > 0 && (
                                <div className="mb-8 flex justify-center sticky top-0 z-20 pt-2">
                                    <div className="relative w-full max-w-sm">
                                        <Search
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                            size={14}
                                        />
                                        <input
                                            type="text"
                                            value={messageSearch}
                                            onChange={(e) => setMessageSearch(e.target.value)}
                                            placeholder="Find a message..."
                                            className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl py-2.5 pl-11 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-2xl placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                            )}

                            {canLoadOlder && (
                                <div className="flex justify-center mb-6">
                                    <button
                                        onClick={() => setVisibleMessageCount(prev => prev + 50)}
                                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all shadow-lg backdrop-blur-md"
                                    >
                                        Load Older Messages
                                    </button>
                                </div>
                            )}

                            {filteredMessages.map((msg, index) => {
                                const isMe = msg.sender === user?.id;
                                const showTimestamp = index === filteredMessages.length - 1 ||
                                    new Date(filteredMessages[index + 1]?.created_at).getTime() - new Date(msg.created_at).getTime() > 300000;

                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                                        <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-md ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                                            {/* Action tools */}
                                            <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mb-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                                {isMe && (
                                                    <button
                                                        onClick={() => setMessageBeingDeleted(msg)}
                                                        className="p-1.5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                                <button className="p-1.5 hover:bg-slate-800 text-slate-600 hover:text-slate-300 rounded-lg transition-colors">
                                                    <Star size={14} />
                                                </button>
                                            </div>

                                            {/* Bubble */}
                                            <div className={`relative px-5 py-3.5 rounded-[2rem] shadow-xl text-sm leading-relaxed ${isMe
                                                ? 'bg-linear-to-br from-emerald-600 to-emerald-700 text-white rounded-br-none'
                                                : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                                                }`}>
                                                {msg.content}

                                                {/* Delivery info for my messages */}
                                                {isMe && (
                                                    <div className="flex items-center justify-end gap-1.5 mt-2 opacity-60">
                                                        <span className="text-[9px] font-bold uppercase tabular-nums">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <CheckCircle2 size={10} className={msg.is_read ? 'text-white' : 'text-emerald-300'} fill="currentColor" />
                                                    </div>
                                                )}

                                                {!isMe && (
                                                    <div className="mt-2 text-[9px] font-bold uppercase text-slate-500 tabular-nums">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Area */}
                        <div className="p-6 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-2xl">
                            {typingText && (
                                <div className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex gap-1">
                                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" />
                                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                    <span>{typingText}</span>
                                </div>
                            )}
                            <div className="relative group">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <div className="flex-1 relative flex items-center">
                                        <button
                                            type="button"
                                            className="absolute left-4 text-slate-500 hover:text-emerald-400 transition-colors p-1"
                                            title="Attach File"
                                        >
                                            <Paperclip size={20} />
                                        </button>
                                        <input
                                            ref={inputRef}
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                handleTypingStart();
                                            }}
                                            placeholder="Write your message here..."
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] pl-14 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-600 shadow-inner group-focus-within:bg-slate-900"
                                        />
                                        <div className="absolute right-4 flex items-center gap-2">
                                            <button
                                                type="button"
                                                className="text-slate-500 hover:text-blue-400 transition-colors p-1"
                                                title="Add Emoji"
                                            >
                                                <Star size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="p-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all duration-300 disabled:opacity-30 disabled:grayscale group-hover:scale-105 active:scale-95"
                                    >
                                        <Send size={20} strokeWidth={2.5} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-950/20 backdrop-blur-sm">
                        <div className="max-w-md animate-in fade-in zoom-in duration-700">
                            <div className="w-24 h-24 bg-emerald-600/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                <Send className="text-emerald-400 rotate-12" size={48} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Your Communication Hub</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Connect with agents, inquire about properties, and manage your real estate journey in one premium, real-time space.
                            </p>
                            <button
                                onClick={() => setShowAgentsList(true)}
                                className="mt-8 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
                            >
                                Start a New Conversation
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Agents List Modal */}
            {showAgentsList && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0B192F] rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b border-[#1E3A5F] flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Verified Agents</h2>
                            <button
                                onClick={() => setShowAgentsList(false)}
                                className="p-1 hover:bg-[#1E3A5F] rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[60vh]">
                            {loadingAgents ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : (
                                verifiedAgents.map((agent) => (
                                    <button
                                        key={agent.id}
                                        onClick={() => handleStartAgentChat(agent.id)}
                                        className="w-full p-4 border-b border-[#1E3A5F] hover:bg-[#1E3A5F]/50 transition-colors flex items-center gap-3"
                                    >
                                        <div className="w-12 h-12 bg-gray-600 rounded-full overflow-hidden">
                                            {agent.user_avatar ? (
                                                <img src={agent.user_avatar} alt={agent.user_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <UserIcon className="text-gray-400" size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white">{agent.user_name}</h3>
                                                <CheckCircle2 size={14} className="text-blue-400" fill="currentColor" />
                                            </div>
                                            <p className="text-sm text-gray-400">{agent.specialties?.join(', ') || 'Real Estate Agent'}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star size={12} className="text-yellow-400" fill="currentColor" />
                                                <span className="text-xs text-gray-400">{agent.average_rating}</span>
                                                <span className="text-xs text-gray-400">• {agent.years_of_experience} years exp.</span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Message Confirmation Modal */}
            {messageBeingDeleted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div
                        className="bg-[#0B192F] border border-[#1E3A5F] rounded-xl p-6 w-full max-w-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                        aria-describedby="delete-description"
                    >
                        <h2 id="delete-title" className="text-lg font-semibold mb-2 text-white">
                            Delete message?
                        </h2>
                        <p id="delete-description" className="text-sm text-gray-300 mb-4">
                            This action cannot be undone. The message will be removed for both you and the other participant.
                        </p>
                        <div className="bg-[#1E3A5F] rounded-md px-3 py-2 text-sm text-gray-100 mb-4 max-h-24 overflow-y-auto">
                            {messageBeingDeleted.content}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setMessageBeingDeleted(null)}
                                className="px-3 py-1.5 text-sm rounded-md bg-transparent text-gray-200 hover:bg-[#1E3A5F]"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteMessage}
                                className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
