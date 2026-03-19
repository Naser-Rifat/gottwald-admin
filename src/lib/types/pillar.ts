export type ContentBlockTheme = "light" | "dark";

export interface ContentBlock {
  id: string;
  type: "rich-text" | "image" | "video";
  theme?: "light" | "dark";
  heading?: string;
  body?: string;
  image?: string;
  videoUrl?: string;
  created_at?: string;
  /** Transient — carries the File for upload, never sent to the API */
  _imageFile?: File;
}

export interface PillarTheme {
  background: string;
  text: string;
  accent: string;
}

export interface Pillar {
  id?: string;
  slug: string;
  title: string;
  tags: string[];
  image: string;
  launchUrl: string;
  description: string;
  details: string;
  services: string[];
  contentBlocks: ContentBlock[];
  theme: PillarTheme;
}

export type CreatePillarPayload = Pillar;
export type UpdatePillarPayload = Partial<Pillar>;
