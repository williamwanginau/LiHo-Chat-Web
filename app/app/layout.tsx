"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { MockDataProvider } from '../../lib/mock';
import { ChatUIProvider } from '../../lib/chat-ui';
import LeftRail from '../../components/LeftRail';
import Sidebar from '../../components/Sidebar';

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
      <ChatUIProvider>
        <div className="app-shell">
          <LeftRail />
          <Sidebar />
          <main className="main">
            <div className="topbar">
              <div className="muted" style={{ fontSize: 12 }}>Signed in as {user.name}</div>
              <div style={{ marginLeft: 'auto' }}>
                <button onClick={logout} className="btn secondary">Logout</button>
              </div>
            </div>
            {children}
          </main>
        </div>
      </ChatUIProvider>
    </MockDataProvider>
  );
}
