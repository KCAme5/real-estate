'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { leadsAPI, Conversation, Message } from '@/lib/api/leads';
import { messagesAPI } from '@/lib/api/messages';
import { useWebSocket, TypingIndicator } from '@/hooks/useWebSocket';
import { Send, User as UserIcon, Home, CheckCircle2, Search, ArrowLeft, MoreVertical, Paperclip, Smile, MessageSquare, Edit3, Trash2, Reply, Copy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

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
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { sendMessage, subscribe, sendTypingIndicator, markMessagesAsRead } = useWebSocket();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Handle typing timeout
    const handleTypingStart = useCallback(() => {
        if (!isTyping && activeConversation) {
            setIsTyping(true);
            sendTypingIndicator(activeConversation.id, true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 1 second
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

                        // Mark as read if we're the recipient
                        if ((message.data as Message).sender !== user?.id) {
                            markMessagesAsRead(activeConversation.id);
                        }
                    } else {
                        // Update conversation list to show new message
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
                    // Update messages to show read status
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

    // Handle auto-selection whenever conversations or URL params change
    useEffect(() => {
        const targetId = conversationIdParam ? parseInt(conversationIdParam) : null;
        const targetRecipient = recipientId ? parseInt(recipientId) : null;
        const targetProperty = propertyId ? parseInt(propertyId) : null;

        if (conversations.length > 0) {
            console.log('Selection params:', { targetId, targetRecipient, targetProperty });

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
                // Only set if it's different to avoid loops
                if (!activeConversation || activeConversation.id !== selected.id) {
                    console.log('Selected conversation:', selected.id);
                    setActiveConversation(selected);
                    fetchMessages(selected.id);
                    setTimeout(() => inputRef.current?.focus(), 300);
                }
                return; // Found and selected, no need to create
            }
        }

        // If we have a recipient but no conversation found (either list is empty or not in list)
        if (!loading && targetRecipient && !isNaN(targetRecipient)) {
            // Guard: don't attempt if we already tried for this recipient+property in this mount session
            const creationKey = `${targetRecipient}-${targetProperty}`;
            if (attemptedCreationRef.current === creationKey) return;

            // Only attempt creation if we haven't already started an active conversation
            // and we aren't currently loading the initial list (wait for it to finish)
            if (!activeConversation) {
                console.log('No existing conversation found for recipient, creating one...');
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

            // Send via WebSocket for real-time delivery
            sendMessage({
                type: 'message',
                conversation_id: activeConversation.id,
                content: newMessage
            });

            // Also send via API as backup
            await leadsAPI.sendMessage(activeConversation.id, newMessage);

            setNewMessage('');
            handleTypingStop();
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
            showError('Failed to send message', 'Please try again');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteConversation = async (conversationId: number) => {
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }

        try {
            await messagesAPI.deleteConversation(conversationId);

            // Remove from local state
            setConversations(prev => prev.filter(conv => conv.id !== conversationId));

            // Clear active conversation if it was the deleted one
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

            // Remove from local state
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
            // Update in local state first (optimistic update)
            setMessages(prev => prev.map(msg =>
                msg.id === editingMessage
                    ? { ...msg, content: editText.trim() }
                    : msg
            ));

            // TODO: Call API to update message
            // await messagesAPI.updateMessage(activeConversation!.id, editingMessage, editText.trim());

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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row bg-background border border-border rounded-[2rem] overflow-hidden shadow-2xl m-4 md:m-8">
            {/* Sidebar: Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-border space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full bg-muted/50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {conversations.length === 0 ? (
                        <div className="p-10 text-center space-y-4 opacity-50">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <MessageSquare className="text-muted-foreground" size={32} />
                            </div>
                            <p className="text-sm font-medium">No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div key={conv.id} className={`w-full p-6 flex gap-4 transition-all border-b border-border/50 hover:bg-muted/30 text-left relative group ${activeConversation?.id === conv.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/10' : ''}`}>
                                <button
                                    onClick={() => {
                                        setActiveConversation(conv);
                                        fetchMessages(conv.id);
                                    }}
                                    className="flex-1 flex gap-4"
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden border border-border/50">
                                            {conv.property_image ? (
                                                <Image src={conv.property_image} alt={conv.property_title || 'Property'} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                    <Home className="text-primary" size={24} />
                                                </div>
                                            )}
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-background">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-sm truncate">{conv.other_user.name}</h3>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 truncate">{conv.property_title || 'General Inquiry'}</p>
                                        <p className="text-xs text-muted-foreground truncate font-medium">
                                            {conv.last_message?.content || 'Started a conversation'}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Delete Conversation Button - Fixed Position */}
                {activeConversation && (
                    <div className="p-4 border-t border-border/50">
                        <button
                            onClick={() => handleDeleteConversation(activeConversation.id)}
                            className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-red-200/50"
                        >
                            <Trash2 size={16} />
                            <span className="font-medium">Delete Conversation</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-muted/10 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 bg-background border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 hover:bg-muted rounded-xl">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-12 h-12 rounded-2xl bg-muted overflow-hidden flex items-center justify-center border border-border/50">
                                    <UserIcon className="text-muted-foreground" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{activeConversation.other_user.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/properties/${activeConversation.property}`} className="p-3 bg-muted/50 hover:bg-muted text-foreground rounded-2xl transition-all border border-border/50">
                                    <Home size={18} />
                                </Link>
                                <button className="p-3 bg-muted/50 hover:bg-muted text-foreground rounded-2xl transition-all border border-border/50">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === user?.id;
                                const isSelected = selectedMessage === msg.id;
                                const isEditing = editingMessage === msg.id;

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                        <div className={`max-w-[80%] space-y-2 ${isMe ? 'text-right' : 'text-left'} relative`}>
                                            {/* Message Actions Dropdown */}
                                            <div className={`absolute ${isMe ? '-left-12' : '-right-12'} top-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMessage(isSelected ? null : msg.id);
                                                    }}
                                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                                                    title="More options"
                                                >
                                                    <MoreVertical size={14} />
                                                </button>

                                                {isSelected && (
                                                    <div className={`absolute ${isMe ? 'right-0' : 'left-0'} top-8 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-10`}>
                                                        {isMe && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEdit(msg);
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                                                >
                                                                    <Edit3 size={14} />
                                                                    Edit
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReply(msg);
                                                            }}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                                        >
                                                            <Reply size={14} />
                                                            Reply
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(msg.content);
                                                            }}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                                        >
                                                            <Copy size={14} />
                                                            Copy
                                                        </button>
                                                        {isMe && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteMessage(msg.id);
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
                                            <div className={`inline-block px-6 py-4 rounded-4xl text-sm font-medium shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-background border border-border rounded-tl-none'}`}>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editText}
                                                            onChange={(e) => setEditText(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleSaveEdit();
                                                                } else if (e.key === 'Escape') {
                                                                    handleCancelEdit();
                                                                }
                                                            }}
                                                            className="bg-transparent border-none outline-none flex-1"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="text-xs font-bold uppercase"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="text-xs font-bold uppercase"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>

                                            {/* Message Info */}
                                            <div className="flex items-center justify-end gap-2 px-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isMe && msg.is_read && <CheckCircle2 size={12} className="text-secondary" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Typing Indicator */}
                            {typingUsers.has(activeConversation?.id || 0) && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] space-y-2 text-left">
                                        <div className="inline-block px-6 py-4 rounded-[2rem] text-sm font-medium shadow-sm bg-background border border-border rounded-tl-none">
                                            <div className="flex items-center gap-2">
                                                <Edit3 size={16} className="text-muted-foreground animate-pulse" />
                                                <span className="text-muted-foreground italic">
                                                    {typingUsers.get(activeConversation?.id || 0)} is typing...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-6 bg-background border-t border-border">
                            {/* Reply Indicator */}
                            {replyingTo && (
                                <div className="mb-3 p-3 bg-muted/50 rounded-2xl border border-border/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">Replying to {replyingTo.sender_name}</span>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{replyingTo.content}</p>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-muted/30 p-2 rounded-4xl border border-border/50 focus-within:ring-2 ring-primary/10 transition-all">
                                <button type="button" className="p-3 text-muted-foreground hover:text-primary rounded-full transition-colors">
                                    <Paperclip size={20} />
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
                                            handleTypingStart();
                                        } else {
                                            handleTypingStop();
                                        }
                                    }}
                                    onBlur={handleTypingStop}
                                    placeholder={editingMessage ? "Edit message..." : "Type your message here..."}
                                    className="flex-1 bg-transparent border-none outline-none py-2 text-sm font-medium"
                                />
                                {editingMessage ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleSaveEdit}
                                            className="p-3 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button type="button" className="p-3 text-muted-foreground hover:text-primary rounded-full transition-colors hidden sm:block">
                                            <Smile size={20} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                        <div className="w-32 h-32 bg-primary/5 rounded-[4rem] flex items-center justify-center border border-primary/10">
                            <MessageSquare className="text-primary opacity-40" size={48} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">Select a conversation</h3>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto">Click on a recipient to view your conversation and property inquiries.</p>
                        </div>
                        <Link href="/properties" className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            Browse Properties
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Suspense } from 'react';

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}

