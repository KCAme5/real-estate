'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { leadsAPI, Conversation, Message } from '@/lib/api/leads';
import { messagesAPI } from '@/lib/api/messages';
import { useWebSocket, TypingIndicator } from '@/hooks/useWebSocket';
import { useToast } from '@/components/ui/toast';

// Import WhatsApp components
import WhatsAppSidebar from './components/WhatsAppSidebar';
import WhatsAppChatArea from './components/WhatsAppChatArea';
import WhatsAppChatInfo from './components/WhatsAppChatInfo';

// Kenyaprime color palette
export const KENYAPRIME_COLORS = {
    GREEN: '#25D366',
    DARK_GREEN: '#128C7E',
    LIGHT_GREEN: '#DCF8C6',
    BLUE: '#53BDEB',
    GRAY: '#E5DDD5',
    DARK_GRAY: '#111B21',
    MEDIUM_GRAY: '#202C33',
    LIGHT_GRAY: '#8696A0',
    WHITE: '#FFFFFF',
    BACKGROUND: '#0B141A',
    SIDEBAR_BG: '#111B21',
    CHAT_BG: '#ECE5DD',
    INPUT_BG: '#2A3942'
};

function MessagesContent() {
    const { user } = useAuth();
    const { success, error: showError, info } = useToast();
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
    const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showChatInfo, setShowChatInfo] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { sendMessage, subscribe, sendTypingIndicator, markMessagesAsRead } = useWebSocket();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleTypingStart = useCallback(() => {
        if (!isTyping && activeConversation) {
            setIsTyping(true);
            sendTypingIndicator(activeConversation.id, true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping && activeConversation) {
                setIsTyping(false);
                sendTypingIndicator(activeConversation.id, false);
            }
        }, 1000);
    }, [isTyping, activeConversation, sendTypingIndicator]);

    const handleTypingStop = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (isTyping && activeConversation) {
            setIsTyping(false);
            sendTypingIndicator(activeConversation.id, false);
        }
    }, [isTyping, activeConversation, sendTypingIndicator]);

    // WebSocket message handler
    useEffect(() => {
        const unsubscribe = subscribe((message) => {
            switch (message.type) {
                case 'message':
                    if (activeConversation && message.data.conversation === activeConversation.id) {
                        setMessages(prev => [...prev, message.data as Message]);
                        scrollToBottom();

                        if ((message.data as Message).sender !== user?.id) {
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
    }, [activeConversation, user?.id, subscribe, markMessagesAsRead, scrollToBottom]);

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

    // Group conversations by agent
    const groupedConversations = React.useMemo(() => {
        const grouped = new Map<number, Conversation>();

        conversations.forEach(conv => {
            const agentId = conv.other_user.id;
            const existing = grouped.get(agentId);

            if (!existing || new Date(conv.updated_at) > new Date(existing.updated_at)) {
                // Count total messages and unread for this agent
                const agentConversations = conversations.filter(c => c.other_user.id === agentId);
                const totalUnread = agentConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
                const totalMessages = agentConversations.reduce((sum, c) => sum + (c.message_count || 0), 0);

                grouped.set(agentId, {
                    ...conv,
                    unread_count: totalUnread,
                    message_count: totalMessages,
                    property_title: agentConversations.length > 1 ? `${agentConversations.length} properties` : conv.property_title,
                    last_message: conv.last_message
                });
            }
        });

        return Array.from(grouped.values());
    }, [conversations]);

    // Filter conversations based on search
    const filteredConversations = groupedConversations.filter(conv =>
        conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.property_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            success('Conversation started', 'You can now message this user');
        } catch (error) {
            console.error('Failed to create conversation:', error);
            showError('Failed to start conversation', 'Please try again');
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
            const tempId = Date.now();

            // Optimistic update
            const tempMessage: Message = {
                id: tempId,
                conversation: activeConversation.id,
                sender: user?.id!,
                content: newMessage,
                created_at: new Date().toISOString(),
                is_read: false,
                sender_name: user?.name || 'You'
            };

            setMessages(prev => [...prev, tempMessage]);
            setNewMessage('');
            scrollToBottom();

            // Send via WebSocket and API
            sendMessage({
                type: 'message',
                conversation_id: activeConversation.id,
                content: newMessage
            });

            await leadsAPI.sendMessage(activeConversation.id, newMessage);

            // Remove optimistic message and replace with real one
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            handleTypingStop();
        } catch (error) {
            console.error('Failed to send message:', error);
            showError('Failed to send message', 'Please try again');
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg.id !== Date.now()));
        } finally {
            setSending(false);
            handleTypingStop();
        }
    };

    const handleDeleteConversation = async (conversationId: number) => {
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }

        try {
            await messagesAPI.deleteConversation(conversationId);
            setConversations(prev => prev.filter(conv => conv.id !== conversationId));

            if (activeConversation?.id === conversationId) {
                setActiveConversation(null);
                setMessages([]);
            }

            success('Conversation deleted', 'The conversation has been permanently deleted');
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            showError('Failed to delete conversation', 'Please try again');
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }

        try {
            await messagesAPI.deleteMessage(activeConversation!.id, messageId);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            success('Message deleted', 'The message has been permanently deleted');
        } catch (error) {
            console.error('Failed to delete message:', error);
            showError('Failed to delete message', 'Please try again');
        }
    };

    const handleReply = (message: Message) => {
        setReplyingTo(message);
        setSelectedMessage(null);
        inputRef.current?.focus();
    };

    const handleCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            success('Copied', 'Message copied to clipboard');
            setSelectedMessage(null);
        } catch (error) {
            showError('Failed to copy', 'Please try again');
        }
    };

    const handleEdit = (message: Message) => {
        setEditingMessage(message.id);
        setEditText(message.content);
        setSelectedMessage(null);
        inputRef.current?.focus();
    };

    const handleSaveEdit = async () => {
        if (!editText.trim() || !editingMessage) return;

        try {
            setMessages(prev => prev.map(msg =>
                msg.id === editingMessage
                    ? { ...msg, content: editText.trim() }
                    : msg
            ));

            setEditingMessage(null);
            setEditText('');
            success('Message updated', 'Your message has been edited');
        } catch (error) {
            console.error('Failed to edit message:', error);
            showError('Failed to edit message', 'Please try again');
        }
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
        setEditText('');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectedMessage !== null) {
                setSelectedMessage(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [selectedMessage]);

    if (loading && !conversations.length) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ backgroundColor: KENYAPRIME_COLORS.DARK_GRAY }}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-green-500 font-medium">Loading Kenyaprime...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen" style={{ backgroundColor: KENYAPRIME_COLORS.DARK_GRAY }}>
            {/* Sidebar - Conversation List */}
            <WhatsAppSidebar
                conversations={filteredConversations}
                activeConversation={activeConversation}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectConversation={(conv) => {
                    setActiveConversation(conv);
                    fetchMessages(conv.id);
                }}
                onDeleteConversation={handleDeleteConversation}
                user={user}
                colors={KENYAPRIME_COLORS}
                isVisible={!activeConversation}
            />

            {/* Chat Area */}
            <WhatsAppChatArea
                activeConversation={activeConversation}
                messages={messages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sending={sending}
                selectedMessage={selectedMessage}
                setSelectedMessage={setSelectedMessage}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                editText={editText}
                setEditText={setEditText}
                typingUsers={typingUsers}
                showChatInfo={showChatInfo}
                setShowChatInfo={setShowChatInfo}
                onSendMessage={handleSendMessage}
                onDeleteMessage={handleDeleteMessage}
                onReply={handleReply}
                onCopy={handleCopy}
                onEdit={handleEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onTypingStart={handleTypingStart}
                onTypingStop={handleTypingStop}
                onCloseChat={() => setActiveConversation(null)}
                user={user}
                inputRef={inputRef}
                messagesEndRef={messagesEndRef}
                colors={KENYAPRIME_COLORS}
            />

            {/* Chat Info Sidebar */}
            {showChatInfo && activeConversation && (
                <WhatsAppChatInfo
                    conversation={activeConversation}
                    onClose={() => setShowChatInfo(false)}
                    colors={KENYAPRIME_COLORS}
                />
            )}
        </div>
    );
}

import { Suspense } from 'react';

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#111B21' }}>
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}
