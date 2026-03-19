import type { CreatePillarPayload, Pillar, UpdatePillarPayload } from "../types/pillar";
import { MOCK_PROJECTS } from "../mock/pillar.mock";

const USE_MOCK = import.meta.env.VITE_DATA_SOURCE === "mock";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── HELPER ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("gottwald_admin_token");
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem("gottwald_admin_token");
    localStorage.removeItem("gottwald_admin_user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }
  return res.json();
}

// ─── GET ALL PILLARS ─────────────────────────────────────────────────────────

export async function getPillars(): Promise<Pillar[]> {
  if (USE_MOCK) return MOCK_PROJECTS;
  return apiFetch<Pillar[]>("/api/pillars");
}

// ─── GET SINGLE PILLAR ───────────────────────────────────────────────────────

export async function getPillar(slug: string): Promise<Pillar | undefined> {
  if (USE_MOCK) return MOCK_PROJECTS.find((p) => p.slug === slug);
  return apiFetch<Pillar>(`/api/pillars/${slug}`);
}

// ─── CREATE PILLAR ───────────────────────────────────────────────────────────

export async function createPillar(
  data: CreatePillarPayload,
): Promise<Pillar> {
  if (USE_MOCK) {
    console.log("[MOCK] CREATE:", data);
    return data;
  }
  return apiFetch<Pillar>("/api/pillars", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── UPDATE PILLAR ───────────────────────────────────────────────────────────

export async function updatePillar(
  slug: string,
  data: UpdatePillarPayload,
): Promise<Pillar> {
  if (USE_MOCK) {
    console.log("[MOCK] UPDATE:", slug, data);
    const existing = MOCK_PROJECTS.find((p) => p.slug === slug)!;
    return { ...existing, ...data };
  }
  return apiFetch<Pillar>(`/api/pillars/${slug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ─── DELETE PILLAR ───────────────────────────────────────────────────────────

export async function deletePillar(slug: string): Promise<void> {
  if (USE_MOCK) {
    console.log("[MOCK] DELETE:", slug);
    return;
  }
  await apiFetch<void>(`/api/pillars/${slug}`, { method: "DELETE" });
}

// ─── UPLOAD IMAGE ─────────────────────────────────────────────────────────────

export async function uploadPillarImage(file: File): Promise<string> {
  if (USE_MOCK) {
    return `/assets/pillar/${file.name}`;
  }
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${BASE_URL}/api/pillars/upload-image`, {
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
