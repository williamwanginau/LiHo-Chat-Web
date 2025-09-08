import './globals.css';
import type { ReactNode } from 'react';
import { AuthProvider } from '../lib/auth';
import { QueryProvider } from '../lib/query';
import ToasterHost from '../components/ToasterHost';
import IconFontLoader from '../components/IconFontLoader';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <QueryProvider>
          <AuthProvider>
            <IconFontLoader />
            <ToasterHost />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
