export const HOME_SCROLL_POS_KEY = 'scrollPos';
export const HOME_RETURNING_KEY = 'homeReturningFromWork';
export const HOME_SCROLL_RESTORED_EVENT = 'home-scroll-restored';
export const HOME_LAYOUT_READY_EVENT = 'home-layout-ready';
export function markHomeReturn(scrollY: number): void {
  sessionStorage.setItem(HOME_SCROLL_POS_KEY, String(Math.round(scrollY)));
  sessionStorage.setItem(HOME_RETURNING_KEY, 'true');
}

export function isReturningToHome(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(HOME_RETURNING_KEY) === 'true';
}

export function peekHomeScrollPosition(): number | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(HOME_SCROLL_POS_KEY);
  if (!raw) return null;

  const y = Number.parseInt(raw, 10);
  return Number.isFinite(y) ? y : null;
}

export function consumeHomeScrollRestore(): number | null {
  const y = peekHomeScrollPosition();
  sessionStorage.removeItem(HOME_SCROLL_POS_KEY);
  sessionStorage.removeItem(HOME_RETURNING_KEY);
  return y;
}

export function dispatchHomeLayoutReady(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(HOME_LAYOUT_READY_EVENT));
}

export function dispatchHomeScrollRestored(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(HOME_SCROLL_RESTORED_EVENT));
}
