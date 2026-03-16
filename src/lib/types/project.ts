export type ContentBlockTheme = "light" | "dark";

export interface ContentBlock {
  id: string;
  type: "rich-text" | "image" | "video";
  theme?: "light" | "dark";
  heading?: string;
  body?: string; // For rich-text, this will contain HTML
  image?: string;
  videoUrl?: string;
}

export interface ProjectTheme {
  background: string;
  text: string;
  accent: string;
}

export interface Project {
  slug: string;
  title: string;
  tags: string[];
  image: string;
  launchUrl: string;
  description: string;
  details: string;
  services: string[];
  contentBlocks: ContentBlock[];
  theme: ProjectTheme;
}

export type CreateProjectPayload = Project;
export type UpdateProjectPayload = Partial<Project>;
