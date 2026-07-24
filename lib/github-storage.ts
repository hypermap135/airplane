/**
 * GitHub-based storage for admin overrides + uploaded photos.
 *
 * Remplace Vercel Blob (dont le plan Hobby limite les Advanced Operations
 * à 2000/mois → quota atteint en 1 mois d'usage admin). GitHub Contents API
 * n'a pas cette limite pour un repo privé/public normal.
 *
 * Trade-off : chaque write déclenche un commit → Vercel redeploy auto
 * (~1-2 min avant que le changement soit live). Les reads sont instantanés
 * car les données sont bundlées au build depuis `data/products-overrides.json`.
 *
 * Env vars requis (à ajouter sur Vercel prod) :
 *   GITHUB_TOKEN   — Fine-grained PAT avec Contents:write sur ce repo
 *   GITHUB_OWNER   — hypermappro
 *   GITHUB_REPO    — airplane
 *   GITHUB_BRANCH  — main (optionnel, défaut: main)
 */

const API = "https://api.github.com";

type StorageEnv = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

function getEnv(): StorageEnv | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo  = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !owner || !repo) return null;
  return { token, owner, repo, branch };
}

/** True quand les 3 env vars principales sont configurées (token/owner/repo). */
export function isGitHubStorageConfigured(): boolean {
  return getEnv() !== null;
}

async function ghFetch(path: string, init: RequestInit = {}, env: StorageEnv) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${env.token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    // Never cache GitHub API responses at the fetch layer — Next.js's
    // unstable_cache handles caching at the store level with tag invalidation.
    cache: "no-store",
  });
  return res;
}

type ContentsResponse = {
  content: string;   // base64
  sha: string;
  encoding: "base64";
};

/** Read a JSON file from the repo. Returns null if the file doesn't exist. */
export async function readJsonFromRepo<T>(
  path: string,
): Promise<{ data: T; sha: string } | null> {
  const env = getEnv();
  if (!env) throw new Error("GitHub storage not configured");

  const res = await ghFetch(
    `/repos/${env.owner}/${env.repo}/contents/${encodeURIComponent(path)}?ref=${env.branch}`,
    { method: "GET" },
    env,
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub read failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const body = (await res.json()) as ContentsResponse;
  const text = Buffer.from(body.content, "base64").toString("utf-8");
  return { data: JSON.parse(text) as T, sha: body.sha };
}

/** Write a JSON file to the repo (create or update). */
export async function writeJsonToRepo(
  path: string,
  data: unknown,
  commitMessage: string,
): Promise<void> {
  const env = getEnv();
  if (!env) throw new Error("GitHub storage not configured");

  // Fetch the current sha to update (GitHub requires it for existing files).
  let sha: string | undefined;
  const existing = await ghFetch(
    `/repos/${env.owner}/${env.repo}/contents/${encodeURIComponent(path)}?ref=${env.branch}`,
    { method: "GET" },
    env,
  );
  if (existing.ok) {
    const body = (await existing.json()) as { sha: string };
    sha = body.sha;
  } else if (existing.status !== 404) {
    throw new Error(`GitHub pre-read failed: ${existing.status}`);
  }

  const content = Buffer.from(
    typeof data === "string" ? data : JSON.stringify(data, null, 2),
    "utf-8",
  ).toString("base64");

  const put = await ghFetch(
    `/repos/${env.owner}/${env.repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: commitMessage,
        content,
        branch: env.branch,
        ...(sha ? { sha } : {}),
        // Commit as the token owner — GitHub uses the account's default
        // git identity attached to the PAT.
      }),
    },
    env,
  );
  if (!put.ok) {
    throw new Error(`GitHub write failed: ${put.status} ${await put.text().catch(() => "")}`);
  }
}

/** Upload a binary file (image) to the repo. Returns the public path. */
export async function uploadFileToRepo(
  path: string,
  fileBuffer: Buffer,
  commitMessage: string,
): Promise<void> {
  const env = getEnv();
  if (!env) throw new Error("GitHub storage not configured");

  // GitHub Contents API refuses files > 100 MB. We're storing product
  // photos (typically < 500 KB in WebP), well within limits.
  if (fileBuffer.length > 25 * 1024 * 1024) {
    throw new Error(`File too large for GitHub Contents API (${fileBuffer.length} bytes, max ~25 MB)`);
  }

  let sha: string | undefined;
  const existing = await ghFetch(
    `/repos/${env.owner}/${env.repo}/contents/${encodeURIComponent(path)}?ref=${env.branch}`,
    { method: "GET" },
    env,
  );
  if (existing.ok) {
    const body = (await existing.json()) as { sha: string };
    sha = body.sha;
  } else if (existing.status !== 404) {
    throw new Error(`GitHub pre-read failed: ${existing.status}`);
  }

  const content = fileBuffer.toString("base64");

  const put = await ghFetch(
    `/repos/${env.owner}/${env.repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: commitMessage,
        content,
        branch: env.branch,
        ...(sha ? { sha } : {}),
      }),
    },
    env,
  );
  if (!put.ok) {
    throw new Error(`GitHub upload failed: ${put.status} ${await put.text().catch(() => "")}`);
  }
}

/** Health check: verify the token is valid and can read the target repo. */
export async function checkGitHubStorage(): Promise<{ ok: boolean; reason?: string }> {
  const env = getEnv();
  if (!env) return { ok: false, reason: "GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO env vars manquants" };
  try {
    const res = await ghFetch(`/repos/${env.owner}/${env.repo}`, { method: "GET" }, env);
    if (res.status === 401) return { ok: false, reason: "Token GitHub invalide (401)" };
    if (res.status === 403) return { ok: false, reason: "Token sans droit Contents:write sur le repo (403)" };
    if (res.status === 404) return { ok: false, reason: `Repo ${env.owner}/${env.repo} introuvable (token n'a peut-être pas accès)` };
    if (!res.ok) return { ok: false, reason: `GitHub API répond ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String(err).slice(0, 200) };
  }
}
