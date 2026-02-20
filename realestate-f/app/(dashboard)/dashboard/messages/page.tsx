'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
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
    Info,
    Plus,
    X,
    Star,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

function MessagesContent() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [mounted, setMounted] = useState(false);
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
    const [showAgentsList, setShowAgentsList] = useState(false);
    const [verifiedAgents, setVerifiedAgents] = useState<Agent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const attemptedCreationRef = useRef<string | null>(null);
    const { sendMessage, subscribe, sendTypingIndicator, markMessagesAsRead } = useWebSocket();

    // All effects must be declared before any conditional returns
    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render until mounted on client (after all hooks are declared)
    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0B192F]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

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
        fetchVerifiedAgents();
        const interval = setInterval(() => {
            fetchConversations(false);
            if (activeConversation) {
                fetchMessages(activeConversation.id, false);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activeConversation?.id]);

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
            c.other_user.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="flex h-screen items-center justify-center bg-[#0B192F]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0B192F] text-white overflow-hidden">
            {/* Left Sidebar - Chats List */}
            <div className={`w-full md:w-96 border-r border-[#1E3A5F] flex flex-col bg-[#0B192F] ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-[#1E3A5F]">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-semibold">Chats</h1>
                        <button
                            onClick={() => setShowAgentsList(true)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1E3A5F] border border-[#2D4A7C] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => {
                                setActiveConversation(conv);
                                fetchMessages(conv.id);
                            }}
                            className={`w-full px-4 py-3 flex gap-3 border-b border-[#1E3A5F] transition-all hover:bg-[#1E3A5F]/50 ${activeConversation?.id === conv.id ? 'bg-[#1E3A5F]' : ''}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 bg-gray-600 rounded-full overflow-hidden">
                                    {conv.other_user.avatar ? (
                                        <img src={conv.other_user.avatar} alt={conv.other_user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <UserIcon className="text-gray-400" size={24} />
                                        </div>
                                    )}
                                </div>
                                {conv.other_user.is_online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B192F]" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-white truncate flex items-center gap-1">
                                        {conv.other_user.name}
                                        {conv.other_user.is_verified && (
                                            <CheckCircle2 size={16} className="text-blue-400" fill="currentColor" />
                                        )}
                                    </h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {conv.last_message ? formatTime(conv.last_message.created_at) : ''}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-400 truncate">
                                    {conv.last_message?.content || 'No messages yet'}
                                </p>
                            </div>

                            {conv.unread_count > 0 && (
                                <span className="w-5 h-5 bg-blue-600 text-xs font-semibold rounded-full flex items-center justify-center">
                                    {conv.unread_count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0B192F]">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setActiveConversation(null)}
                                    className="md:hidden p-2 hover:bg-[#1E3A5F] rounded-full"
                                >
                                    <X size={20} />
                                </button>
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gray-600 rounded-full overflow-hidden">
                                        {activeConversation.other_user.avatar ? (
                                            <img src={activeConversation.other_user.avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UserIcon className="text-gray-400" size={20} />
                                            </div>
                                        )}
                                    </div>
                                    {activeConversation.other_user.is_online && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B192F]" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white">
                                            {activeConversation.other_user.name}
                                        </h3>
                                        {activeConversation.other_user.is_verified && (
                                            <CheckCircle2 size={14} className="text-blue-400" fill="currentColor" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {activeConversation.other_user.is_online ? 'ONLINE' : 'OFFLINE'}
                                        {activeConversation.property_title && ` • Re: ${activeConversation.property_title}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-[#1E3A5F] rounded-full transition-colors">
                                    <Phone size={18} />
                                </button>
                                <button className="p-2 hover:bg-[#1E3A5F] rounded-full transition-colors">
                                    <Video size={18} />
                                </button>
                                <button className="p-2 hover:bg-[#1E3A5F] rounded-full transition-colors">
                                    <Info size={18} />
                                </button>
                                <button className="p-2 hover:bg-[#1E3A5F] rounded-full transition-colors">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-4"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231E3A5F' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        >
                            {messages.map((msg) => {
                                const isMe = msg.sender === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                                        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                                            <div className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-[#1E3A5F] text-white rounded-bl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <CheckCircle2 size={12} className={msg.is_read ? 'text-blue-400' : 'text-gray-400'} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-[#1E3A5F] bg-[#0B192F]">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    ref={inputRef}
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        handleTypingStart();
                                    }}
                                    placeholder="Ask a question about this listing..."
                                    className="flex-1 bg-[#1E3A5F] border border-[#2D4A7C] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserIcon className="text-blue-500" size={40} />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Select a chat to start messaging</h3>
                            <p className="text-gray-400">Choose a conversation from list or start a new one</p>
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
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#0B192F]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}
