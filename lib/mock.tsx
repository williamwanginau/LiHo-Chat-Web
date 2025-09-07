"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from './api';
import { useAuth } from './auth';

export type Friend = {
  id: string;
  email: string;
  name: string;
};

export type ChatSummary = {
  id: string;
  title: string;
  isDM: boolean;
  updatedAt: string;
  lastMessage?: string;
};

export type Message = {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  createdAt: string;
};

type MockContextValue = {
  friends: Friend[];
  chats: ChatSummary[];
  messagesByChatId: Record<string, Message[]>;
  addFriend: (email: string) => { ok: true } | { ok: false; error: string };
};

const MockContext = createContext<MockContextValue | null>(null);

export function useMock() {
  const ctx = useContext(MockContext);
  if (!ctx) throw new Error('useMock must be used within <MockDataProvider>');
  return ctx;
}

function seedForUser(user: AuthUser) {
  const isAlice = user.email.toLowerCase() === 'alice@example.com';
  const self: Friend = { id: user.id, email: user.email, name: user.name };
  const other: Friend = isAlice
    ? { id: 'u-bob', email: 'bob@example.com', name: 'Bob' }
    : { id: 'u-alice', email: 'alice@example.com', name: 'Alice' };

  const dmId = isAlice ? 'dm:alice:bob' : 'dm:bob:alice';
  const now = new Date();
  const messages: Message[] = [
    {
      id: 'm1',
      chatId: dmId,
      userId: other.id,
      content: isAlice ? 'Hello from Bob!' : 'Hello from Alice!',
      createdAt: new Date(now.getTime() - 60_000).toISOString(),
    },
    {
      id: 'm2',
      chatId: dmId,
      userId: self.id,
      content: 'Hi! 👋',
      createdAt: new Date(now.getTime() - 30_000).toISOString(),
    },
  ];

  const chats: ChatSummary[] = [
    {
      id: dmId,
      title: other.name,
      isDM: true,
      updatedAt: messages[messages.length - 1].createdAt,
      lastMessage: messages[messages.length - 1].content,
    },
    {
      id: 'room:public',
      title: 'Public Room',
      isDM: false,
      updatedAt: new Date(now.getTime() - 10_000).toISOString(),
      lastMessage: 'Welcome to the public room!',
    },
  ];

  return {
    friends: [other],
    chats,
    messagesByChatId: { [dmId]: messages, 'room:public': [] },
  } satisfies Pick<MockContextValue, 'friends' | 'chats' | 'messagesByChatId'>;
}

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [messagesByChatId, setMessages] = useState<Record<string, Message[]>>({});

  // Seed when user changes
  useEffect(() => {
    if (!user) return;
    const seed = seedForUser(user);
    setFriends(seed.friends);
    setChats(seed.chats);
    setMessages(seed.messagesByChatId);
  }, [user]);

  const addFriend = useCallback(
    (email: string) => {
      const e = email.trim().toLowerCase();
      if (!user) return { ok: false as const, error: 'Not signed in' };
      if (e === user.email.toLowerCase()) return { ok: false as const, error: 'Cannot add yourself as a friend' };
      const allowed = ['alice@example.com', 'bob@example.com'];
      if (!allowed.includes(e)) return { ok: false as const, error: 'User does not exist (demo restriction)' };
      if (friends.some((f) => f.email.toLowerCase() === e)) return { ok: false as const, error: 'Already in friends list' };
      const newFriend: Friend = e === 'alice@example.com'
        ? { id: 'u-alice', email: 'alice@example.com', name: 'Alice' }
        : { id: 'u-bob', email: 'bob@example.com', name: 'Bob' };
      setFriends((s) => [...s, newFriend]);
      // Optional: create corresponding DM entry
      const a = user.email.toLowerCase() < e ? user.email.split('@')[0] : newFriend.name.toLowerCase();
      const b = user.email.toLowerCase() < e ? newFriend.name.toLowerCase() : user.email.split('@')[0];
      const dmId = `dm:${a}:${b}`;
      setChats((s) =>
        s.some((c) => c.id === dmId)
          ? s
          : [
              ...s,
              {
                id: dmId,
                title: newFriend.name,
                isDM: true,
                updatedAt: new Date().toISOString(),
                lastMessage: 'Say hi!'
              },
            ],
      );
      setMessages((m) => (m[dmId] ? m : { ...m, [dmId]: [] }));
      return { ok: true as const };
    },
    [user, friends],
  );

  const value = useMemo<MockContextValue>(
    () => ({ friends, chats, messagesByChatId, addFriend }),
    [friends, chats, messagesByChatId, addFriend],
  );

  return <MockContext.Provider value={value}>{children}</MockContext.Provider>;
}
