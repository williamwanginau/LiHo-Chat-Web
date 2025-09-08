"use client";

import { useMemo, useRef, useState } from 'react';
import { useMock } from '../lib/mock';
import { useChatUI } from '../lib/chat-ui';
import { useSmartScrollbar } from '../hooks/useSmartScrollbar';
import { formatListTime } from '../lib/date';
import { formatUnread } from '../lib/format';
import { useRoomsQuery } from '../lib/data';
import type { RoomListItem } from '../lib/mock';

export default function Sidebar() {
  const { chats } = useMock();
  const { selectedChatId, setSelectedChatId } = useChatUI();
  const [q, setQ] = useState('');
  const roomsQ = useRoomsQuery();

  const merged: RoomListItem[] = useMemo(() => {
    const apiRooms = roomsQ.data?.items ?? [];
    if (apiRooms.length === 0) return chats; // fallback to mock when API empty/unavailable
    return apiRooms
      .map<RoomListItem>((r) => ({
        id: r.id,
        name: r.name,
        type: 'GROUP',
        updatedAt: r.updatedAt,
        lastMessage: r.lastMessage?.content,
        unread: 0,
      }))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [roomsQ.data, chats]);

  const filtered = useMemo(() => {
    const v = q.trim().toLowerCase();
    const xs = [...merged];
    if (!v) return xs;
    return xs.filter((c) => c.name.toLowerCase().includes(v));
  }, [q, merged]);
  const listRef = useRef<HTMLDivElement>(null);
  useSmartScrollbar(listRef, { hoverMs: 1000, scrollMs: 300 });

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="search">
          <span className="material-symbols-outlined">search</span>
          <input
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div ref={listRef} className="sidebar-list">
        {filtered.map((c) => {
          const active = c.id === selectedChatId;
          return (
            <button key={c.id} className={`chat-item ${active ? 'active' : ''}`} onClick={() => setSelectedChatId(c.id)}>
              <div className="chat-text">
                <div className="chat-title">{c.name}</div>
                {c.lastMessage && <div className="chat-sub">{c.lastMessage}</div>}
              </div>
              <div className="chat-meta">
                <div className="meta-time">{formatListTime(c.updatedAt)}</div>
                {c.unread && c.unread > 0 ? (
                  <div className="badge">{formatUnread(c.unread)}</div>
                ) : (
                  <div className="badge empty" />
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <div className="muted" style={{ padding: 12 }}>No chats</div>}
      </div>
    </aside>
  );
}
