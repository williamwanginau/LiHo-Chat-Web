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
  const [loading, setLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const urls = ['/api/livez', '/api/readyz'];
      const out: Resp[] = [];
      for (const u of urls) {
        try {
          const res = await fetch(u, { cache: 'no-store' });
          const ctype = res.headers.get('content-type');
          let data: any = undefined;
          if (ctype && ctype.includes('application/json')) {
            data = await res.json();
          } else {
            const text = await res.text();
            data = text.slice(0, 500);
          }
          out.push({
            url: u,
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            contentType: ctype,
            data,
          });
        } catch (e: any) {
          out.push({
            url: u,
            ok: false,
            status: 0,
            statusText: 'NETWORK/JS ERROR',
            error: String(e?.message || e),
          });
        }
      }
      setResults(out);
      setCheckedAt(new Date().toLocaleString());
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); }, []);

  const labelOf = (u: string) => (u.includes('livez') ? 'Live' : 'Ready');
  const statusClass = (r: Resp) => {
    if (!r.ok) return 'err';
    if (!r.contentType || !r.contentType.includes('application/json')) return 'warn';
    return 'ok';
  };
  const toggle = (key: string) => setExpanded((s) => ({ ...s, [key]: !s[key] }));

  return (
    <main className="container">
      <header className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: '0 0 4px' }}>System Health</h1>
          <div className="muted" style={{ fontSize: 14 }}>
            REST via proxy: <code>/api → {process.env.NEXT_PUBLIC_API_URL || '(not set)'}</code>
          </div>
        </div>
        <div className="row">
          <button className="btn secondary" onClick={run} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="space" />
      <div className="muted" style={{ fontSize: 13 }}>
        {checkedAt ? `Last checked: ${checkedAt}` : 'Checking…'}
      </div>

      <div className="space" />
      {error && <pre style={{ color: '#ef4444' }}>{error}</pre>}

      <section className="grid">
        {(results || []).map((r) => {
          const sc = statusClass(r);
          const key = r.url;
          const isOpen = !!expanded[key];
          return (
            <div key={key} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="row">
                  <span className={`dot ${sc}`} />
                  <strong>{labelOf(r.url)}</strong>
                </div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {r.status} {r.statusText}
                </div>
              </div>
              <div className="space" />
              <div className="muted" style={{ fontSize: 13 }}>
                <code>{r.url}</code>
              </div>
              {r.contentType && (
                <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                  Content-Type: {r.contentType}
                </div>
              )}
              <div className="space" />
              <div className="row" style={{ gap: 10 }}>
                <a className="btn secondary" href={r.url} target="_blank" rel="noreferrer">
                  Open raw
                </a>
                <button className="btn" onClick={() => toggle(key)}>
                  {isOpen ? 'Hide details' : 'Show details'}
                </button>
              </div>

              {isOpen && (
                <div style={{ marginTop: 12 }}>
                  {r.error ? (
                    <pre style={{ color: '#ef4444', whiteSpace: 'pre-wrap' }}>{r.error}</pre>
                  ) : (
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                      {typeof r.data === 'string' ? r.data : JSON.stringify(r.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}
