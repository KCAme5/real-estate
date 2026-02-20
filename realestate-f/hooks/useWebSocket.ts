'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
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

type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'failed';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageCallbacksRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set());
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [hasWebSocketFailed, setHasWebSocketFailed] = useState(false);
  const hasEverConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setConnectionState('failed');
      setHasWebSocketFailed(true);
      return;
    }
    setConnectionState('connecting');
    setHasWebSocketFailed(false);

    if (typeof window === 'undefined') {
      return;
    }

    let wsUrl: string;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

    // Derive WebSocket URL from API Base URL
    // e.g., https://api.example.com/api -> wss://api.example.com/ws/chat/
    const baseUrl = apiBaseUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
    wsUrl = `${baseUrl}/ws/chat/`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
        hasEverConnectedRef.current = true;
        setConnectionState('open');

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
          console.debug('WebSocket: Error parsing message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        if (!event.wasClean) {

          if (isAuthenticated && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current += 1;
            const attempt = reconnectAttemptsRef.current;
            const delay = Math.min(30000, 1000 * Math.pow(2, attempt - 1));

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            setConnectionState('failed');
            setHasWebSocketFailed(true);
          }
        } else {
          setConnectionState('closed');
        }
      };

      wsRef.current.onerror = () => {
        setHasWebSocketFailed(true);
      };

    } catch (error) {
      console.debug('WebSocket: Connection creation failed.');
      setConnectionState('failed');
      setHasWebSocketFailed(true);
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
    setConnectionState('closed');
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

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
      setConnectionState('idle');
      setHasWebSocketFailed(false);
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
    disconnect,
    connectionState,
    hasWebSocketFailed,
    hasEverConnected: hasEverConnectedRef.current
  };
};
