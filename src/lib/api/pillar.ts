import type { ContentBlock, CreatePillarPayload, Pillar, PillarTheme, UpdatePillarPayload } from "../types/pillar";
import { MOCK_PROJECTS } from "../mock/pillar.mock";
import { refreshAccessToken, clearSession, updateTokens, STORAGE_KEYS } from "./auth";

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
  theme?: string | PillarTheme;
  image?: string;
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
    theme: toTheme(api.theme),
    contentBlocks: blocks,
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
          headers: getHeaders(useJson),
          ...options,
        });
      } catch {
        clearSession();
        window.location.href = "/login";
        throw new Error("Session expired.");
      }
    }
    if (res.status === 401) {
      clearSession();
      window.location.href = "/login";
      throw new Error("Session expired.");
    }
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
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
  const items = res.data ?? [];
  return items.map(mapApiPillarToPillar);
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

// ─── UPLOAD IMAGE ─────────────────────────────────────────────────────────────

export async function uploadPillarImage(file: File): Promise<string> {
  if (USE_MOCK) {
    return `/assets/pillar/${file.name}`;
  }
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${BASE_URL}/api/v1/pillars/upload-image/`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
  const result = await res.json();
  return result.url as string;
}
