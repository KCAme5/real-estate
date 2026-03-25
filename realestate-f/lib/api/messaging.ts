import { apiClient } from './client';

export interface Message {
  id: number;
  sender: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  receiver: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  message_type: 'text' | 'image' | 'file' | 'property';
  content: string;
  property?: {
    id: number;
    title: string;
    price: string;
    main_image?: string;
  };
  is_read: boolean;
  attachments: Array<{
    id: number;
    file: string;
    filename: string;
    file_size: number;
    content_type: string;
    created_at: string;
  }>;
  reactions: Array<{
    id: number;
    user: {
      id: number;
      username: string;
    };
    reaction: string;
    created_at: string;
  }>;
  time_since_created: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  participants: Array<{
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  }>;
  last_message?: Message;
  other_participant?: {
    id: number;
    username: string;
    profile_picture?: string;
  };
  unread_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationList {
  id: number;
  other_participant?: {
    id: number;
    username: string;
    profile_picture?: string;
  };
  last_message_preview?: {
    content: string;
    created_at: string;
    sender: string;
  };
  unread_count: number;
  updated_at: string;
}

export interface CreateMessageData {
  receiver: number;
  message_type?: 'text' | 'image' | 'file' | 'property';
  content: string;
  property?: number;
}

export const messagingAPI = {
  // Messages
  getMessages: (params?: { user_id?: number }) =>
    apiClient.get('/messaging/messages/', { params }),

  getMessage: (id: number) =>
    apiClient.get(`/messaging/messages/${id}/`),

  createMessage: (data: CreateMessageData) =>
    apiClient.post('/messaging/messages/', data),

  getConversationMessages: (userId: number) =>
    apiClient.get(`/messaging/messages/conversation/?user_id=${userId}`),

  markMessageAsRead: (id: number) =>
    apiClient.post(`/messaging/messages/${id}/mark_read/`, {}),

  reactToMessage: (id: number, reaction: string) =>
    apiClient.post(`/messaging/messages/${id}/react/`, { reaction }),

  deleteMessage: (id: number) =>
    apiClient.post(`/messaging/messages/${id}/delete_message/`, {}),

  getUnreadCount: () =>
    apiClient.get('/messaging/messages/unread_count/'),

  // Conversations
  getConversations: () =>
    apiClient.get('/messaging/conversations/'),

  getConversation: (id: number) =>
    apiClient.get(`/messaging/conversations/${id}/`),

  getConversationsList: () =>
    apiClient.get('/messaging/conversations/list_conversations/'),

  markAllConversationAsRead: (id: number) =>
    apiClient.post(`/messaging/conversations/${id}/mark_all_read/`, {}),

  deleteConversation: (id: number) =>
    apiClient.post(`/messaging/conversations/${id}/delete_conversation/`, {}),
};