"use client";

import { useMemo, useRef } from 'react';
import { useMock } from '../lib/mock';
import { useChatUI } from '../lib/chat-ui';
import { useAuth } from '../lib/auth';
import { useSmartScrollbar } from '../hooks/useSmartScrollbar';
import { formatHM } from '../lib/date';

export default function MessageList() {
  const { messagesByChatId } = useMock();
  const { selectedChatId } = useChatUI();
  const { user } = useAuth();
  const msgs = useMemo(() => (selectedChatId ? messagesByChatId[selectedChatId] ?? [] : []), [messagesByChatId, selectedChatId]);
  const minuteKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
  };
  const listRef = useRef<HTMLDivElement>(null);
  useSmartScrollbar(listRef, { hoverMs: 1000, scrollMs: 300 });
  return (
    <div ref={listRef} className="msg-list">
      {msgs.map((m, i) => {
        const mine = m.userId === user?.id;
        const prev = i > 0 ? msgs[i - 1] : null;
        const showTs = !prev || minuteKey(prev.createdAt) !== minuteKey(m.createdAt);
        return (
          <div key={m.id} className={`msg-row ${mine ? 'mine' : ''}`}>
            <div className={`msg-inner ${mine ? 'mine' : ''}`}>
              {mine && showTs && <div className="ts side">{formatHM(m.createdAt)}</div>}
              <div className={`bubble ${mine ? 'mine' : ''}`}>{m.content}</div>
              {!mine && showTs && <div className="ts side">{formatHM(m.createdAt)}</div>}
            </div>
          </div>
        );
      })}
      {msgs.length === 0 && <div className="muted" style={{ padding: 12 }}>No messages</div>}
    </div>
  );
}
