"use client";

/**
 * Wishlist — tiny zustand-free store backed by localStorage.
 * Components subscribe via useWishlist(); changes broadcast across
 * tabs through the storage event so the heart-counter stays in sync.
 */

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "airplanestore.wishlist.v1";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    window.dispatchEvent(new Event("wishlist-changed"));
  } catch {/* quota or disabled */}
}

export function useWishlist() {
  const [items, setItems] = useState<Set<string>>(() => read());

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener("storage", sync);
    window.addEventListener("wishlist-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("wishlist-changed", sync);
    };
  }, []);

  const toggle = useCallback((handle: string) => {
    const next = new Set(items);
    if (next.has(handle)) next.delete(handle);
    else next.add(handle);
    write(next);
    setItems(next);
  }, [items]);

  const has = useCallback((handle: string) => items.has(handle), [items]);

  return { items: [...items], count: items.size, has, toggle };
}
