"use client";

import { useMemo } from 'react';
import { useMock } from '../lib/mock';
import { useChatUI } from '../lib/chat-ui';

export default function ChatHeader() {
  const { chats } = useMock();
  const { selectedChatId } = useChatUI();
  const chat = useMemo(() => chats.find((c) => c.id === selectedChatId) || null, [chats, selectedChatId]);
  return (
    <div className="chat-header">
      <div className="chat-header-title">
        <strong>{chat?.title ?? 'Select a chat'}</strong>
      </div>
      <div className="chat-header-actions">
        <button className="icon-btn" aria-label="Search in conversation">
          <span className="material-symbols-outlined">search</span>
        </button>
        <button className="icon-btn" aria-label="More">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
    </div>
  );
}

