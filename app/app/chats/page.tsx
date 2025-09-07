"use client";

import { useMemo } from 'react';
import { useMock } from '../../../lib/mock';

export default function ChatsPage() {
  const { chats } = useMock();
  const sorted = useMemo(
    () => [...chats].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [chats],
  );
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Chats</h1>
      <ul style={{ display: 'grid', gap: 8 }}>
        {sorted.map((c) => (
          <li key={c.id} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{c.title}</strong>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{new Date(c.updatedAt).toLocaleString()}</span>
            </div>
            {c.lastMessage && (
              <div className="muted" style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                {c.lastMessage}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
