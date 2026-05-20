import type { ContentBlock, CreatePillarPayload, Pillar, PillarTheme, UpdatePillarPayload } from "../types/pillar";
import { MOCK_PROJECTS } from "../mock/pillar.mock";
import { refreshAccessToken, clearSession, updateTokens, STORAGE_KEYS } from "./auth";
import { ApiError } from "./error";

const USE_MOCK = import.meta.env.VITE_DATA_SOURCE === "mock";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

// ─── API RESPONSE SHAPES ─────────────────────────────────────────────────────

interface ApiContentBlock {
  id?: string;
  type: string;
  theme?: string;
  heading?: string;
  body?: string;
  image?: string;
  video_url?: string;
  order?: number;
  created_at?: string;
}

interface ApiPillar {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  details?: string;
  launch_url?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string | string[];
  services?: string | string[];
  offers?: string | unknown[];
  theme?: string | PillarTheme;
  image?: string;
  order?: number;
  content_blocks?: ApiContentBlock[];
  content_blocks_data?: ApiContentBlock[];
}

interface PillarsListResponse {
  status: number;
  success: boolean;
  message?: string;
  data: ApiPillar[];
  pagination?: {
    total_items: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [String(val)];
  const result: string[] = [];
  for (const item of arr) {
    const s = String(item).trim();
    if (!s) continue;
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        result.push(...toArray(parsed));
      } else if (typeof parsed === "string") {
        result.push(parsed.trim());
      } else {
        result.push(s);
      }
    } catch {
      if (!s.startsWith("[")) result.push(s);
    }
  }
  return result.filter(Boolean);
}

const DEFAULT_THEME: PillarTheme = {
  background: "#0a0a0a",
  text: "#f5f5f5",
  accent: "#c9a84c",
};

function toTheme(val: string | PillarTheme | undefined): PillarTheme {
  if (!val) return DEFAULT_THEME;
  if (typeof val === "object" && "background" in val) return val;
  try {
    const parsed = JSON.parse(String(val));
    return parsed?.background ? parsed : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function toOffers(val: string | unknown[] | undefined): Pillar["offers"] {
  if (!val) return [];
  if (Array.isArray(val)) return val as Pillar["offers"];
  try {
    const parsed = JSON.parse(String(val));
    return Array.isArray(parsed) ? (parsed as Pillar["offers"]) : [];
  } catch {
    return [];
  }
}

const VALID_BLOCK_TYPES = ["rich-text", "image", "video"];

function mapApiPillarToPillar(api: ApiPillar): Pillar {
  const rawBlocks = api.content_blocks_data ?? api.content_blocks ?? [];
  const blocks = rawBlocks
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(
      (b): ContentBlock => ({
        id: b.id?.trim() || crypto.randomUUID(),
        type: VALID_BLOCK_TYPES.includes(b.type) ? (b.type as ContentBlock["type"]) : "rich-text",
        theme: (b.theme === "dark" ? "dark" : "light") as ContentBlock["theme"],
        heading: b.heading,
        body: b.body,
        image: b.image,
        videoUrl: b.video_url,
        created_at: b.created_at,
      })
    );
  return {
    id: api.id,
    slug: api.slug,
    title: api.title,
    description: api.description ?? "",
    details: api.details ?? api.description ?? "",
    image: api.image ?? "",
    launchUrl: api.launch_url ?? "",
    tags: toArray(api.tags),
    services: toArray(api.services),
    offers: toOffers(api.offers),
    theme: toTheme(api.theme),
    contentBlocks: blocks,
    order: api.order ?? 0,
  };
}

function buildFormData(p: CreatePillarPayload | UpdatePillarPayload, imageFile?: File | null): FormData {
  const fd = new FormData();
  if (p.title != null) fd.append("title", p.title);
  if (p.slug != null) fd.append("slug", p.slug);
  if (p.description != null) fd.append("description", p.description);
  if (p.details != null) fd.append("details", p.details);
  if (p.launchUrl != null) fd.append("launch_url", p.launchUrl);
  if (p.tags != null) fd.append("tags", JSON.stringify(toArray(p.tags)));
  if (p.services != null) fd.append("services", JSON.stringify(toArray(p.services)));
  if (p.offers != null) fd.append("offers", JSON.stringify(p.offers));
  if (p.theme != null) fd.append("theme", JSON.stringify(p.theme));
  fd.append("is_active", "true");
  if (p.contentBlocks != null) {
    const blocks = p.contentBlocks.map((b, i) => {
      const { _imageFile, ...rest } = b;
      const blockJson: Record<string, unknown> = {
        id: rest.id,
        type: rest.type,
        theme: rest.theme,
        heading: rest.heading ?? "",
        body: rest.body ?? "",
        order: i,
      };
      if (rest.created_at) blockJson.created_at = rest.created_at;
      if (rest.videoUrl) blockJson.video_url = rest.videoUrl;
      if (_imageFile) {
        blockJson.image = "";
        fd.append(`content_blocks[${i}][image]`, _imageFile);
      } else if (rest.image) {
        blockJson.image = rest.image;
      }
      return blockJson;
    });
    fd.append("content_blocks_data", JSON.stringify(blocks));
  }
  if (imageFile) fd.append("image", imageFile);
  // Omit pillar image when no new file — backend expects File only
  return fd;
}

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

function getHeaders(json = true): HeadersInit {
  const token = getToken();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function doFetch<T>(
  endpoint: string,
  options: RequestInit,
  useJson = true,
): Promise<T> {
  let res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: getHeaders(useJson),
    ...options,
  });

  if (res.status === 401) {
    const refresh = localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (refresh) {
      try {
        const result = await refreshAccessToken(refresh);
        updateTokens(result.accessToken, result.refreshToken);
        res = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers: getHeaders(useJson),
        });
      } catch {
        clearSession();
        window.dispatchEvent(new Event("auth:unauthorized"));
        throw new Error("Session expired.");
      }
    }
    if (res.status === 401) {
      clearSession();
      window.dispatchEvent(new Event("auth:unauthorized"));
      throw new Error("Session expired.");
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    try {
      const json = JSON.parse(errorText);
      throw new ApiError(json.detail || json.message || "Request failed", res.status, json);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(`API Error: ${errorText}`, res.status);
    }
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return doFetch<T>(endpoint, { headers: getHeaders(true), ...options }, true);
}

async function apiFetchForm<T>(endpoint: string, method: string, body: FormData): Promise<T> {
  return doFetch<T>(endpoint, { method, body }, false);
}

// ─── GET ALL PILLARS ─────────────────────────────────────────────────────────

export async function getPillars(): Promise<Pillar[]> {
  if (USE_MOCK) return MOCK_PROJECTS;
  const res = await apiFetch<PillarsListResponse>("/api/v1/pillars/");
  // Backend returns pillars sorted by `order` ascending (then -created_at).
  // Display in that exact order so DnD reordering is round-trippable.
  return (res.data ?? []).map(mapApiPillarToPillar);
}

// ─── REORDER PILLARS ─────────────────────────────────────────────────────────

export async function reorderPillars(ids: string[]): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch<void>("/api/v1/pillars/reorder/", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ─── GET SINGLE PILLAR ───────────────────────────────────────────────────────

export async function getPillarById(id: string): Promise<Pillar | undefined> {
  if (USE_MOCK) return MOCK_PROJECTS.find((p) => (p as { id?: string }).id === id || p.slug === id);
  try {
    const res = await apiFetch<{ data?: ApiPillar } | ApiPillar>(`/api/v1/pillars/${id}/`);
    const api = "data" in res && res.data ? res.data : (res as ApiPillar);
    return mapApiPillarToPillar(api);
  } catch {
    return undefined;
  }
}

/** @deprecated Use getPillarById when you have id. Falls back to slug lookup via list. */
export async function getPillar(slugOrId: string): Promise<Pillar | undefined> {
  const pillars = await getPillars();
  const found = pillars.find((p) => p.slug === slugOrId || p.id === slugOrId);
  if (found?.id) return getPillarById(found.id);
  return found;
}

// ─── CREATE PILLAR ───────────────────────────────────────────────────────────

export async function createPillar(data: CreatePillarPayload, imageFile?: File | null): Promise<Pillar> {
  if (USE_MOCK) {
    const api: ApiPillar = { ...data as unknown as ApiPillar, slug: data.slug };
    return mapApiPillarToPillar(api);
  }
  const fd = buildFormData(data, imageFile);
  const res = await apiFetchForm<{ data?: ApiPillar } | ApiPillar>("/api/v1/pillars/", "POST", fd);
  const api = res && typeof res === "object" && "data" in res && res.data ? res.data : (res as ApiPillar);
  return mapApiPillarToPillar(api);
}

// ─── UPDATE PILLAR ───────────────────────────────────────────────────────────

export async function updatePillar(id: string, data: UpdatePillarPayload, imageFile?: File | null): Promise<Pillar> {
  if (USE_MOCK) {
    const api: ApiPillar = { ...data as unknown as ApiPillar, id, slug: data.slug ?? "" };
    return mapApiPillarToPillar(api);
  }
  const fd = buildFormData(data, imageFile);
  const res = await apiFetchForm<{ data?: ApiPillar } | ApiPillar>(`/api/v1/pillars/${id}/`, "PATCH", fd);
  const api = res && typeof res === "object" && "data" in res && res.data ? res.data : (res as ApiPillar);
  return mapApiPillarToPillar(api);
}

// ─── DELETE PILLAR ───────────────────────────────────────────────────────────

export async function deletePillar(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/pillars/${id}/`, { method: "DELETE" });
}


