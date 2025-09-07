"use client";

import { useMemo, useRef, useState } from 'react';
import { useMock } from '../lib/mock';
import { useChatUI } from '../lib/chat-ui';
import { useSmartScrollbar } from '../hooks/useSmartScrollbar';
import { formatListTime } from '../lib/date';
import { formatUnread } from '../lib/format';

export default function Sidebar() {
  const { chats } = useMock();
  const { selectedChatId, setSelectedChatId } = useChatUI();
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const v = q.trim().toLowerCase();
    const xs = [...chats].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    if (!v) return xs;
    return xs.filter((c) => c.name.toLowerCase().includes(v));
  }, [q, chats]);
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
