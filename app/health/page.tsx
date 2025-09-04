'use client';

import { useEffect, useState } from 'react';

export default function HealthPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prefer proxy via Next.js rewrites (see next.config.mjs)
    const url = `/api/healthz`;
    fetch(url)
      .then(async (res) => {
        const ctype = res.headers.get('content-type') || '';
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
        }
        if (!ctype.includes('application/json')) {
          const body = await res.text().catch(() => '');
          throw new Error(`Expected JSON, got '${ctype}'. Body: ${body.slice(0, 200)}`);
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Health Check</h1>
      <p>API (proxied): /api → {process.env.NEXT_PUBLIC_API_URL || '(not set)'}</p>
      {error && <pre style={{ color: 'crimson' }}>{error}</pre>}
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading…</p>}
    </main>
  );
}
