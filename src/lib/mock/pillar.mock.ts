import type { Pillar } from "../types/pillar";

export const MOCK_PROJECTS: Pillar[] = [
  {
    slug: "solution-finder",
    title: "SolutionFinder & Management",
    tags: ["STRATEGY", "CLARITY"],
    image: "/assets/projects/solution-finder-scifi.png",
    launchUrl: "https://google.com/",
    description: "Every Complex Situation Has a Structure.",
    details:
      "When people, processes, technology and decisions interact, complexity becomes inevitable. SolutionFinder creates clarity through structured analysis. Solution Management drives resolution — a situation is solved when it no longer creates operational friction.",
    services: [
      "Structured Analysis",
      "Root Cause Diagnostics",
      "Implementation Support",
      "Systemic Resolution",
    ],
    contentBlocks: [
      {
        id: "block-1",
        type: "rich-text",
        theme: "light",
        heading: "Deconstructing Complexity",
        body: "<p>SolutionFinder creates clarity through structured analysis.</p>",
        image: "/assets/projects/solution-finder-scifi.png",
      },
      {
        id: "block-2",
        type: "rich-text",
        theme: "dark",
        heading: "The Framework",
        body: "<h3>Phase 1: Diagnostics</h3><p>We isolate the exact operational bottlenecks.</p><h3>Phase 2: Resolution</h3><p>A situation is truly solved only when it requires zero daily mental energy from ownership.</p>",
      },
      {
        id: "block-3",
        type: "rich-text",
        theme: "dark",
        image: "/assets/projects/solution-finder-scifi.png",
      },
    ],
    theme: {
      background: "#121212",
      text: "#F5F5F5",
      accent: "#A8B4B8",
    },
  },
];
