export type ContentBlockTheme = "light" | "dark";

export interface ContentBlock {
  id: string;
  type: "rich-text" | "image" | "video" |"feature";
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

export interface Offer {
  title: string;
  tier: "copper" | "silver" | "gold";
  description: string;
  deliverable: string;
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
  offers: Offer[];
  theme: PillarTheme;
  order?: number;
}

export type CreatePillarPayload = Pillar;
export type UpdatePillarPayload = Partial<Pillar>;
