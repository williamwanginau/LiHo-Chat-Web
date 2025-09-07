"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/app/chats', icon: 'chat', label: 'Chats' },
  { href: '/app/friends', icon: 'group', label: 'Friends' },
];

export default function LeftRail() {
  const pathname = usePathname();
  return (
    <aside className="rail">
      <div className="rail-inner">
        <Link href="/" className="rail-logo" aria-label="Home">
          <span className="material-symbols-outlined">home</span>
        </Link>
        <nav className="rail-nav">
          {items.map((it) => {
            const active = pathname?.startsWith(it.href);
            return (
              <Link key={it.href} href={it.href} className={`rail-btn ${active ? 'active' : ''}`} aria-label={it.label}>
                <span className="material-symbols-outlined">{it.icon}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rail-foot">
          <Link href="#" className="rail-btn" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </Link>
          <Link href="#" className="rail-btn" aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

