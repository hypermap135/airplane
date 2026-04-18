"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { PRODUCTS, type Product } from "./products";

const STORAGE_KEY = "airplanestore.cart.v1";

export type CartLine = { variantId: string; quantity: number };

type Listener = () => void;
const listeners = new Set<Listener>();
let state: CartLine[] = [];
let hydrated = false;

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) state = parsed as CartLine[];
    }
  } catch {}
}

function subscribe(listener: Listener): () => void {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartLine[] {
  return state;
}

function getServerSnapshot(): CartLine[] {
  return [];
}

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type CartEntry = { product: Product; quantity: number };

export function useCart(): {
  lines: CartLine[];
  entries: CartEntry[];
  subtotal: number;
  count: number;
  add: (variantId: string, quantity?: number) => void;
  update: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
} {
  const lines = useCartLines();
  const entries = lines
    .map((l) => {
      const product = PRODUCTS.find((p) => p.variantId === l.variantId);
      return product ? { product, quantity: l.quantity } : null;
    })
    .filter((x): x is CartEntry => x !== null);
  const subtotal = entries.reduce((sum, e) => sum + e.product.price * e.quantity, 0);
  const count = entries.reduce((sum, e) => sum + e.quantity, 0);

  const add = useCallback((variantId: string, quantity = 1) => {
    const existing = state.find((l) => l.variantId === variantId);
    if (existing) {
      state = state.map((l) =>
        l.variantId === variantId ? { ...l, quantity: l.quantity + quantity } : l,
      );
    } else {
      state = [...state, { variantId, quantity }];
    }
    persist();
    emit();
  }, []);

  const update = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      state = state.filter((l) => l.variantId !== variantId);
    } else {
      state = state.map((l) => (l.variantId === variantId ? { ...l, quantity } : l));
    }
    persist();
    emit();
  }, []);

  const remove = useCallback((variantId: string) => {
    state = state.filter((l) => l.variantId !== variantId);
    persist();
    emit();
  }, []);

  const clear = useCallback(() => {
    state = [];
    persist();
    emit();
  }, []);

  return { lines, entries, subtotal, count, add, update, remove, clear };
}

export function useCartDrawer(): {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
} {
  const openSnap = useSyncExternalStore(
    (cb) => {
      drawerListeners.add(cb);
      return () => drawerListeners.delete(cb);
    },
    () => drawerOpen,
    () => false,
  );
  const setOpen = useCallback((v: boolean) => {
    drawerOpen = v;
    for (const l of drawerListeners) l();
  }, []);
  const toggle = useCallback(() => {
    drawerOpen = !drawerOpen;
    for (const l of drawerListeners) l();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = openSnap ? "hidden" : "";
  }, [openSnap]);

  return { open: openSnap, setOpen, toggle };
}

let drawerOpen = false;
const drawerListeners = new Set<Listener>();

export function openCartDrawer(): void {
  drawerOpen = true;
  for (const l of drawerListeners) l();
}
