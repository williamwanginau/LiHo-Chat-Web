"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMock } from './mock';

type ChatUIValue = {
  selectedChatId: string | null;
  setSelectedChatId: (id: string) => void;
};

const ChatUIContext = createContext<ChatUIValue | null>(null);

export function useChatUI() {
  const ctx = useContext(ChatUIContext);
  if (!ctx) throw new Error('useChatUI must be used within <ChatUIProvider>');
  return ctx;
}

export function ChatUIProvider({ children }: { children: React.ReactNode }) {
  const { chats } = useMock();
  const [selectedChatId, setSelectedChatIdState] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedChatId && chats.length > 0) setSelectedChatIdState(chats[0].id);
  }, [selectedChatId, chats]);

  const setSelectedChatId = useCallback((id: string) => setSelectedChatIdState(id), []);
  const value = useMemo(() => ({ selectedChatId, setSelectedChatId }), [selectedChatId, setSelectedChatId]);
  return <ChatUIContext.Provider value={value}>{children}</ChatUIContext.Provider>;
}

