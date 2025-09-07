"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatUI } from '../lib/chat-ui';
import { useAuth } from '../lib/auth';
import { useMock } from '../lib/mock';

export default function Composer() {
  const { selectedChatId } = useChatUI();
  const { user } = useAuth();
  const { addMessage } = useMock();

  const [val, setVal] = useState('');
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!val.trim() || !selectedChatId || !user) return;
        addMessage(selectedChatId, user.id, val.trim());
        setVal('');
        if (ref.current) ref.current.style.height = 'auto';
      }
    },
    [val, selectedChatId, user, addMessage],
  );

  const onInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    ta.style.height = 'auto';
    ta.style.height = Math.min(160, ta.scrollHeight) + 'px';
  }, []);

  // Ensure height resets when value becomes empty (avoid leftover tall box)
  useEffect(() => {
    if (ref.current && !val) {
      ref.current.style.height = 'auto';
    }
  }, [val]);

  return (
    <div className="composer">
      <button className="icon-btn" aria-label="Emoji">
        <span className="material-symbols-outlined">mood</span>
      </button>
      <textarea
        ref={ref}
        className="input"
        placeholder="Type a message"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={onKeyDown}
        onInput={onInput}
        rows={1}
      />
      <button className="icon-btn" aria-label="Attach">
        <span className="material-symbols-outlined">attach_file</span>
      </button>
    </div>
  );
}
