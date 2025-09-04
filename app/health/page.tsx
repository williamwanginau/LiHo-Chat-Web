'use client';

import { useEffect, useState } from 'react';

export default function HealthPage() {
  type Resp = {
    url: string;
    ok: boolean;
    status: number;
    statusText: string;
    contentType?: string | null;
    data?: any;
    error?: string;
  };
  const [results, setResults] = useState<Resp[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prefer proxy via Next.js rewrites (see next.config.mjs)
    const urls = ['/api/healthz', '/api/health'];
    Promise.all(
      urls.map(async (u): Promise<Resp> => {
        try {
          const res = await fetch(u, { cache: 'no-store' });
          const ctype = res.headers.get('content-type');
          let data: any = undefined;
          if (ctype && ctype.includes('application/json')) {
            data = await res.json();
          } else {
            const text = await res.text();
            data = text.slice(0, 200);
          }
          return {
            url: u,
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            contentType: ctype,
            data,
          };
        } catch (e: any) {
          return {
            url: u,
            ok: false,
            status: 0,
            statusText: 'NETWORK/JS ERROR',
            error: String(e?.message || e),
          };
        }
      }),
    )
      .then(setResults)
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Health Check</h1>
      <p>API (proxied): /api → {process.env.NEXT_PUBLIC_API_URL || '(not set)'}</p>
      <p>WS: {process.env.NEXT_PUBLIC_WS_URL || '(not set)'}</p>
      {error && <pre style={{ color: 'crimson' }}>{error}</pre>}
      {results ? (
        <section>
          {results.map((r) => (
            <div key={r.url} style={{ margin: '12px 0', padding: 12, border: '1px solid #ddd' }}>
              <div>
                <strong>Request:</strong> <code>{r.url}</code>
              </div>
              <div>
                <strong>Status:</strong> {r.status} {r.statusText} {r.ok ? '✅' : '❌'}
              </div>
              {r.contentType && (
                <div>
                  <strong>Content-Type:</strong> {r.contentType}
                </div>
              )}
              {r.error ? (
                <pre style={{ color: 'crimson', whiteSpace: 'pre-wrap' }}>{r.error}</pre>
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap' }}>{
                  typeof r.data === 'string' ? r.data : JSON.stringify(r.data, null, 2)
                }</pre>
              )}
              <div>
                <a href={r.url} target="_blank" rel="noreferrer">
                  Open raw
                </a>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <p>Loading…</p>
      )}
    </main>
  );
}
