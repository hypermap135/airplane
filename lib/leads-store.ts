/**
 * Persistance des leads (cart-abandonment + newsletter) sur GitHub storage.
 * Fichier : data/leads.json — array append-only, avec sentEmails[] pour ne
 * pas re-relancer un client déjà notifié.
 *
 * Structure :
 *   {
 *     leads: [
 *       { email, source, cartValue?, cartItems?, createdAt, sent: { j1?: number, j3?: number } }
 *     ]
 *   }
 *
 * La lecture est cachée 60s (voir github-storage.ts) — le cron rappels
 * force un fresh via revalidateTag après chaque envoi pour ne pas re-envoyer.
 */

import { readJsonFromRepo, writeJsonToRepo, isGitHubStorageConfigured } from "@/lib/github-storage";
import { revalidateTag } from "next/cache";

const FILE_PATH = "data/leads.json";

export type CartItemSnapshot = {
  variantId: string;
  quantity: number;
  title?: string;
  price?: number;
};

export type Lead = {
  email: string;
  source: string;
  cartValue?: number;
  cartItems?: CartItemSnapshot[];
  createdAt: number; // epoch ms
  sent?: { j1?: number; j3?: number };
};

type LeadsFile = { leads: Lead[] };

async function readAll(): Promise<{ data: LeadsFile; sha?: string } | null> {
  if (!isGitHubStorageConfigured()) return null;
  const res = await readJsonFromRepo<LeadsFile>(FILE_PATH);
  if (!res) return { data: { leads: [] } };
  return { data: res.data, sha: res.sha };
}

export async function saveLead(lead: Lead): Promise<void> {
  if (!isGitHubStorageConfigured()) {
    console.warn("[leads-store] GitHub storage non configuré — lead perdu");
    return;
  }
  const current = (await readAll()) ?? { data: { leads: [] } };
  // Dedup par email — si déjà présent on met à jour cartValue/cartItems + timestamp
  const existing = current.data.leads.findIndex((l) => l.email === lead.email);
  if (existing >= 0) {
    current.data.leads[existing] = {
      ...current.data.leads[existing],
      ...lead,
      // Ne pas écraser les timestamps d'envois
      sent: current.data.leads[existing].sent,
    };
  } else {
    current.data.leads.push(lead);
  }
  await writeJsonToRepo(FILE_PATH, current.data, `chore: lead capture ${lead.email}`);
  try { revalidateTag("products"); } catch { /* noop */ }
}

export async function listLeads(): Promise<Lead[]> {
  const current = await readAll();
  return current?.data.leads ?? [];
}

export async function markSent(email: string, kind: "j1" | "j3"): Promise<void> {
  const current = await readAll();
  if (!current) return;
  const idx = current.data.leads.findIndex((l) => l.email === email);
  if (idx < 0) return;
  current.data.leads[idx].sent = { ...(current.data.leads[idx].sent ?? {}), [kind]: Date.now() };
  await writeJsonToRepo(FILE_PATH, current.data, `chore: sent ${kind} to ${email}`);
  try { revalidateTag("products"); } catch { /* noop */ }
}
