"use client";

import { useEffect } from 'react';

export default function IconFontLoader() {
  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    // When all fonts are ready, reveal icon glyphs to avoid text flash
    // @ts-ignore
    (document.fonts as FontFaceSet).ready.then(() => {
      document.documentElement.classList.add('icons-ready');
    });
  }, []);
  return null;
}

