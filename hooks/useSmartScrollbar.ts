"use client";

import { RefObject, useEffect, useRef } from 'react';

type Options = { hoverMs?: number; scrollMs?: number };

export function useSmartScrollbar(ref: RefObject<HTMLElement>, opts: Options = {}) {
  const { hoverMs = 1000, scrollMs = 300 } = opts;
  const hoverTimer = useRef<number | undefined>(undefined);
  const scrollTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      el.classList.add('scrolling');
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => el.classList.remove('scrolling'), scrollMs) as unknown as number;
    };
    const onEnter = () => {
      el.classList.add('hovering');
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
      hoverTimer.current = window.setTimeout(() => el.classList.remove('hovering'), hoverMs) as unknown as number;
    };
    const onLeave = () => {
      el.classList.remove('hovering');
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    };
    el.addEventListener('scroll', onScroll);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    };
  }, [ref, hoverMs, scrollMs]);
}

