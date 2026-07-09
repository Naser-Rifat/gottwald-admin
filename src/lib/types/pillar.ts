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

export type OfferCurrency = "EUR" | "USD" | "CHF" | "GBP" | "GEL";

export interface Offer {
  title: string;
  tier: "copper" | "silver" | "gold";
  description: string;
  deliverable: string;
  /** Optional numeric price. null/undefined = no price shown ("Contact for quote"). */
  price?: number | null;
  /** Defaults to EUR. Only meaningful when price is set. */
  currency?: OfferCurrency;
}

export type CoachingVariant = "business" | "personal";
export type CoachingStage = "session" | "intensive" | "retainer";

/** Single stage cell (title/price/description/deliverable). */
export interface CoachingStageData {
  title: string;
  description: string;
  deliverable: string;
  price: number | null;
  currency: OfferCurrency;
}

/** One track (e.g. Leadership / Executive) with variants → stages. */
export interface CoachingTrack {
  label: string;
  variants: Partial<Record<CoachingVariant, {
    stages: Partial<Record<CoachingStage, CoachingStageData>>;
  }>>;
}

/**
 * Coaching-only nested offer structure. Only rendered/edited for the
 * "coaching-mentoring" pillar; other pillars keep an empty object.
 */
export interface CoachingMatrix {
  tracks: Record<string, CoachingTrack>;
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
  coachingMatrix: CoachingMatrix | Record<string, never>;
  theme: PillarTheme;
  order?: number;
}

export type CreatePillarPayload = Pillar;
export type UpdatePillarPayload = Partial<Pillar>;
