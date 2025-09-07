export function formatUnread(n: number): string {
  if (n > 999) return '999+';
  return String(n);
}

