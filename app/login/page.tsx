"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import type { ApiError } from '../../lib/api';

type DemoUser = { label: string; email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const { user, token, loading, login } = useAuth();

  const demos: DemoUser[] = useMemo(
    () => [
      { label: 'Alice', email: 'alice@example.com', password: 'demopass123' },
      { label: 'Bob', email: 'bob@example.com', password: 'demopass123' },
    ],
    [],
  );

  const [email, setEmail] = useState<string>(demos[0]?.email ?? '');
  const [password, setPassword] = useState<string>(demos[0]?.password ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Redirect when already logged in
  useEffect(() => {
    if (!loading && token && user) router.replace('/app');
  }, [loading, token, user, router]);

  // Cooldown timer for 429
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Pre-warm backend on login page to mitigate cold start latency
  useEffect(() => {
    let aborted = false;
    const ctl = new AbortController();
    const warm = async () => {
      try {
        await fetch('/api/livez', { signal: ctl.signal, cache: 'no-store' });
      } catch {
        // ignore
      }
    };
    if (!loading && !token) warm();
    return () => {
      aborted = true;
      ctl.abort();
    };
  }, [loading, token]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting || cooldown > 0) return;
      setSubmitting(true);
      setError(null);
      try {
        await login(email, password);
        router.replace('/app');
      } catch (err) {
        const anyErr = err as ApiError;
        if (anyErr?.status === 401) setError('Invalid email or password');
        else if (anyErr?.status === 403) setError('Account disabled');
        else if (anyErr?.status === 429) {
          setError('Too many attempts, please try again later');
          setCooldown(10);
        } else if (anyErr?.isTimeout) {
          setError('Request timed out. The server may be waking up. Please try again shortly.');
        } else setError(`Login failed: ${anyErr?.message ?? 'Unknown error'}`);
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, cooldown, email, password, login, router],
  );

  const onSelectDemo = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const picked = demos.find((d) => d.email === e.target.value);
      if (picked) {
        setEmail(picked.email);
        setPassword(picked.password);
      }
    },
    [demos],
  );

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (token && user) return null; // redirected

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 12 }}>Login</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Demo account</span>
          <select value={email} onChange={onSelectDemo} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}>
            {demos.map((d) => (
              <option key={d.email} value={d.email}>
                {d.label} ({d.email})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" type="email" required style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" required style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} />
        </label>

        {error && <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>}
        <button type="submit" disabled={submitting || cooldown > 0} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6 }}>
          {submitting ? 'Signing in…' : cooldown > 0 ? `Try again in ${cooldown}s` : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
