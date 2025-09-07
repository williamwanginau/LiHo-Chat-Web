"use client";

import { useCallback, useState } from 'react';
import { useMock } from '../../../lib/mock';
import { toast } from 'react-hot-toast';

export default function FriendsPage() {
  const { friends, addFriend } = useMock();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setOk(null);
      const res = addFriend(email);
      if (res.ok) {
        setOk('Friend added');
        toast.success('Friend added');
        setEmail('');
      } else {
        setError(res.error);
        toast.error(res.error);
      }
    },
    [email, addFriend],
  );

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Friends</h1>
      <ul style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {friends.map((f) => (
          <li key={f.email} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <strong>{f.name}</strong>
            <div className="muted" style={{ fontSize: 13, color: '#6b7280' }}>{f.email}</div>
          </li>
        ))}
        {friends.length === 0 && <li className="muted">No friends yet</li>}
      </ul>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 380 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Add friend (demo supports only alice/bob)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Friend email"
            required
            style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
          />
        </label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" className="btn">Add</button>
          {ok && <span style={{ color: '#16a34a', fontSize: 13 }}>{ok}</span>}
          {error && <span style={{ color: '#ef4444', fontSize: 13 }}>{error}</span>}
        </div>
      </form>
    </main>
  );
}
