import type { Project, CreateProjectPayload, UpdateProjectPayload } from "../types/project";
import { MOCK_PROJECTS } from "../mock/projects.mock";

const USE_MOCK = import.meta.env.VITE_DATA_SOURCE === "mock";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── HELPER ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("gottwald_admin_token");
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  // If backend returns 401 — token expired or invalid
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

// ─── GET ALL PROJECTS ─────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  if (USE_MOCK) return MOCK_PROJECTS;
  return apiFetch<Project[]>("/api/projects");
}

// ─── GET SINGLE PROJECT ───────────────────────────────────────────────────────

export async function getProject(slug: string): Promise<Project | undefined> {
  if (USE_MOCK) return MOCK_PROJECTS.find((p) => p.slug === slug);
  return apiFetch<Project>(`/api/projects/${slug}`);
}

// ─── CREATE PROJECT ───────────────────────────────────────────────────────────

export async function createProject(data: CreateProjectPayload): Promise<Project> {
  if (USE_MOCK) {
    console.log("[MOCK] CREATE:", data);
    return data;
  }
  return apiFetch<Project>("/api/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── UPDATE PROJECT ───────────────────────────────────────────────────────────

export async function updateProject(
  slug: string,
  data: UpdateProjectPayload
): Promise<Project> {
  if (USE_MOCK) {
    console.log("[MOCK] UPDATE:", slug, data);
    const existing = MOCK_PROJECTS.find((p) => p.slug === slug)!;
    return { ...existing, ...data };
  }
  return apiFetch<Project>(`/api/projects/${slug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ─── DELETE PROJECT ───────────────────────────────────────────────────────────

export async function deleteProject(slug: string): Promise<void> {
  if (USE_MOCK) {
    console.log("[MOCK] DELETE:", slug);
    return;
  }
  await apiFetch<void>(`/api/projects/${slug}`, { method: "DELETE" });
}

// ─── UPLOAD IMAGE ─────────────────────────────────────────────────────────────

export async function uploadProjectImage(file: File): Promise<string> {
  if (USE_MOCK) {
    console.log("[MOCK] UPLOAD IMAGE:", file.name);
    return `/assets/projects/${file.name}`;
  }
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${BASE_URL}/api/projects/upload-image`, {
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
