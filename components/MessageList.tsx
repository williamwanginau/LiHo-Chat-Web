"use client";

import { useMemo, useRef } from 'react';
import { useMock } from '../lib/mock';
import { useChatUI } from '../lib/chat-ui';
import { useAuth } from '../lib/auth';
import { useSmartScrollbar } from '../hooks/useSmartScrollbar';
import { formatHM } from '../lib/date';
import { useRoomMessagesInfinite } from '../lib/data';

export default function MessageList() {
  const { messagesByChatId } = useMock();
  const { selectedChatId } = useChatUI();
  const { user } = useAuth();

  const inf = useRoomMessagesInfinite(selectedChatId, 20);
  const apiMsgs = useMemo(() => {
    const pages = inf.data?.pages ?? [];
    const xs = pages.flatMap((p) => p.items);
    return xs.map((m) => ({
      id: m.id,
      chatId: m.roomId,
      userId: m.author.id,
      content: m.content,
      createdAt: m.createdAt,
    }));
  }, [inf.data]);

  const msgs = useMemo(() => {
    if (apiMsgs.length > 0) return [...apiMsgs].reverse(); // API is desc; UI expects old -> new
    return selectedChatId ? messagesByChatId[selectedChatId] ?? [] : [];
  }, [apiMsgs, messagesByChatId, selectedChatId]);

  const minuteKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
  };
  const listRef = useRef<HTMLDivElement>(null);
  useSmartScrollbar(listRef, { hoverMs: 1000, scrollMs: 300 });
  return (
    <div ref={listRef} className="msg-list">
      {inf.hasNextPage && (
        <button className="btn secondary" onClick={() => inf.fetchNextPage()} disabled={inf.isFetchingNextPage}>
          {inf.isFetchingNextPage ? 'Loading…' : 'Load older'}
        </button>
      )}
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
