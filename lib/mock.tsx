"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from './api';
import { useAuth } from './auth';

export type Friend = {
  id: string;
  email: string;
  name: string;
};

export type RoomType = 'DM' | 'GROUP';
export type RoomListItem = {
  id: string;
  name: string;
  type: RoomType;
  updatedAt: string; // ISO string
  lastMessage?: string;
  unread?: number;
};

export type Message = {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
};

type MockContextValue = {
  friends: Friend[];
  chats: RoomListItem[];
  messagesByChatId: Record<string, Message[]>;
  addMessage: (chatId: string, userId: string, content: string) => void;
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

  const chats: RoomListItem[] = [
    {
      id: dmId,
      name: other.name,
      type: 'DM',
      updatedAt: messages[messages.length - 1].createdAt,
      lastMessage: messages[messages.length - 1].content,
      unread: 2,
    },
    {
      id: 'room:public',
      name: 'Public Room',
      type: 'GROUP',
      updatedAt: new Date(now.getTime() - 10_000).toISOString(),
      lastMessage: 'Welcome to the public room!',
      unread: 0,
    },
    // Additional mock chats for UI testing
    {
      id: 'team:design',
      name: 'Design Team',
      type: 'GROUP',
      updatedAt: new Date(now.getTime() - 45 * 60_000).toISOString(), // 45 minutes ago (same day)
      lastMessage: 'Please review the new mockups',
      unread: 1,
    },
    {
      id: 'team:eng',
      name: 'Engineering',
      type: 'GROUP',
      updatedAt: new Date(now.getTime() - 3 * 60 * 60_000).toISOString(), // 3 hours ago (AM/PM)
      lastMessage: 'Ship it! 🚀',
      unread: 12,
    },
    {
      id: 'team:mkt',
      name: 'Marketing',
      type: 'GROUP',
      updatedAt: new Date(now.getTime() - 26 * 60 * 60_000).toISOString(), // ~1 day ago (Yesterday)
      lastMessage: 'Campaign CTR looks good',
      unread: 0,
    },
    {
      id: 'team:allhands',
      name: 'All Hands',
      type: 'GROUP',
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60_000 - 60 * 60_000).toISOString(), // ~2 days ago (weekday)
      lastMessage: 'Slides are uploaded',
      unread: 3,
    },
    {
      id: 'guild:frontend',
      name: 'Frontend Guild',
      type: 'GROUP',
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60_000).toISOString(), // 5 days ago (weekday)
      lastMessage: 'React 19 notes',
      unread: 57,
    },
    {
      id: 'room:support',
      name: 'Support',
      type: 'GROUP',
      updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60_000).toISOString(), // 8 days (date)
      lastMessage: 'Ticket #12345 resolved',
      unread: 1203,
    },
    {
      id: 'room:random',
      name: 'Random',
      type: 'GROUP',
      updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60_000).toISOString(), // 15 days (date)
      lastMessage: 'Friday memes',
      unread: 0,
    },
  ];

  return {
    friends: [other],
    chats,
    messagesByChatId: {
      [dmId]: messages,
      'room:public': [],
      'team:design': [],
      'team:eng': [],
      'team:mkt': [],
      'team:allhands': [],
      'guild:frontend': [],
      'room:support': [],
      'room:random': [],
    },
  } satisfies Pick<MockContextValue, 'friends' | 'chats' | 'messagesByChatId'>;
}

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [chats, setChats] = useState<RoomListItem[]>([]);
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
                name: newFriend.name,
                type: 'DM',
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

  const addMessage = useCallback(
    (chatId: string, userId: string, content: string) => {
      const msg: Message = {
        id: `m-${Date.now()}`,
        chatId,
        userId,
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => {
        const prev = m[chatId] ?? [];
        return { ...m, [chatId]: [...prev, msg] };
      });
      setChats((cs) => {
        const out = cs.map((c) => (c.id === chatId ? { ...c, lastMessage: content, updatedAt: msg.createdAt } : c));
        out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
        return [...out];
      });
    },
    [],
  );

  const value = useMemo<MockContextValue>(
    () => ({ friends, chats, messagesByChatId, addMessage, addFriend }),
    [friends, chats, messagesByChatId, addMessage, addFriend],
  );

  return <MockContext.Provider value={value}>{children}</MockContext.Provider>;
}
