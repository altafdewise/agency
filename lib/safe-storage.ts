"use client";

/**
 * sessionStorage that never throws. Browsers that block site data ("block all
 * cookies", some private modes, sandboxed iframes) throw a SecurityError on the
 * mere `window.sessionStorage` access, which would otherwise take the whole page
 * down. Every read and write here degrades to "nothing stored".
 */
function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function sessionGet(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function sessionSet(key: string, value: string) {
  try {
    storage()?.setItem(key, value);
  } catch {
    // Quota exceeded or storage blocked: the value simply isn't kept.
  }
}

export function sessionRemove(key: string) {
  try {
    storage()?.removeItem(key);
  } catch {
    // Storage blocked: nothing to remove.
  }
}
