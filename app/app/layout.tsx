"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { MockDataProvider } from '../../lib/mock';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token, user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!token || !user)) {
      router.replace('/login');
    }
  }, [loading, token, user, router]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!token || !user) return null; // redirected

  return (
    <MockDataProvider>
      <div>
        <header style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #e5e7eb' }}>
          <nav style={{ display: 'flex', gap: 12 }}>
            <Link href="/app/chats">Chats</Link>
            <Link href="/app/friends">Friends</Link>
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{user.name}</span>
            <button onClick={logout} style={{ border: '1px solid #d1d5db', padding: '4px 8px', borderRadius: 6 }}>Logout</button>
          </div>
        </header>
        <div>{children}</div>
      </div>
    </MockDataProvider>
  );
}
