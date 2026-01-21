'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message } from '@/lib/api/leads';

export interface TypingIndicator {
  conversation_id: number;
  user_id: number;
  user_name: string;
  is_typing: boolean;
}

export interface ReadReceipt {
  conversation_id: number;
  reader_id: number;
}

export type WebSocketMessage =
  | { type: 'message'; data: Message }
  | { type: 'typing'; data: TypingIndicator }
  | { type: 'read_receipt'; data: ReadReceipt };

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageCallbacksRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set());

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    // Stop trying after max attempts to avoid flooding console/server
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log('WebSocket: Max reconnection attempts reached. Falling back to polling.');
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/chat/`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          messageCallbacksRef.current.forEach(callback => callback(message));
        } catch (error) {
          // Subtle log for parsing errors
          console.debug('WebSocket: Error parsing message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        // Only log close if it wasn't a clean disconnect
        if (!event.wasClean) {
          console.log('WebSocket disconnected (expected if backend has no WS support)');

          // Attempt to reconnect after 5 seconds with exponential backoff or just limit
          if (isAuthenticated && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current += 1;
            const delay = 5000 * reconnectAttemptsRef.current;

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          }
        }
      };

      wsRef.current.onerror = () => {
        // Silencing the error object log as it's often empty and intrusive
        // We handle the fallout in onclose
      };

    } catch (error) {
      // Fallback log
      console.debug('WebSocket: Connection creation failed.');
    }
  }, [isAuthenticated, user]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, message not sent:', data);
    }
  }, []);

  const subscribe = useCallback((callback: (message: WebSocketMessage) => void) => {
    messageCallbacksRef.current.add(callback);
    return () => {
      messageCallbacksRef.current.delete(callback);
    };
  }, []);

  const sendTypingIndicator = useCallback((conversationId: number, isTyping: boolean) => {
    sendMessage({
      type: 'typing',
      conversation_id: conversationId,
      is_typing: isTyping
    });
  }, [sendMessage]);

  const markMessagesAsRead = useCallback((conversationId: number) => {
    sendMessage({
      type: 'mark_read',
      conversation_id: conversationId
    });
  }, [sendMessage]);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  return {
    sendMessage,
    subscribe,
    sendTypingIndicator,
    markMessagesAsRead,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect
  };
};