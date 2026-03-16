import type { ContentBlock, ProjectTheme } from "../lib/types/pillar";
import { Eye, EyeOff, ArrowLeft, ExternalLink } from "lucide-react";

interface ProjectPreviewData {
  title: string;
  slug: string;
  description: string;
  details: string;
  tags: string[];
  services: string[];
  image: string;
  launchUrl: string;
  theme: ProjectTheme;
  contentBlocks: ContentBlock[];
}

interface ProjectPreviewProps {
  data: ProjectPreviewData;
  visible: boolean;
  onToggle: () => void;
}

export default function ProjectPreview({
  data,
  visible,
  onToggle,
}: ProjectPreviewProps) {
  const { theme, contentBlocks } = data;
  const bg = theme.background || "#121212";
  const txt = theme.text || "#F5F5F5";
  const accent = theme.accent || "#A8B4B8";

  return (
    <div className="space-y-4">
      {/* Toggle Bar */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-zinc-700/60 bg-zinc-900/80 text-sm font-semibold text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all group"
      >
        <span className="flex items-center gap-2.5">
          {visible ? (
            <Eye className="w-4 h-4 text-emerald-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-zinc-500" />
          )}
          Live Preview — Public Website
        </span>
        <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {visible ? "Hide" : "Show"}
        </span>
      </button>

      {!visible && (
        <p className="text-xs text-zinc-600 text-center">
          Toggle to see how this pillar will look on the public website.
        </p>
      )}

      {visible && (
        <div className="rounded-xl overflow-hidden border border-zinc-700/40 shadow-2xl">
          {/* Scale wrapper — preview is rendered at reduced scale */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin">
            <div
              className="flex"
              style={{ minWidth: `${(1 + contentBlocks.length) * 820}px` }}
            >
              {/* ═══ PANEL 1 — Hero ═══ */}
              <HeroPanel data={data} bg={bg} txt={txt} accent={accent} />

              {/* ═══ Content Block Panels ═══ */}
              {contentBlocks.map((block, i) => (
                <ContentBlockPanel
                  key={block.id || i}
                  block={block}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* Info Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-t border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-600">
              {1 + contentBlocks.length} panel
              {contentBlocks.length > 0 ? "s" : ""} · horizontal scroll →
            </span>
            <span className="text-[10px] text-zinc-600">
              Scroll to preview all panels
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// HERO PANEL — mirrors the public site's Panel 1
// ════════════════════════════════════════════════════════════════════

function HeroPanel({
  data,
  bg,
  txt,
  accent,
}: {
  data: ProjectPreviewData;
  bg: string;
  txt: string;
  accent: string;
}) {
  const hasImage = !!data.image;

  return (
    <div
      className="shrink-0 flex"
      style={{
        width: "820px",
        height: "520px",
        backgroundColor: bg,
        color: txt,
        position: "relative",
      }}
    >
      {/* Fixed nav replica */}
      <div
        className="absolute top-0 left-0 w-full flex justify-between items-center z-10"
        style={{ padding: "16px 36px" }}
      >
        <span
          className="flex items-center gap-1.5 text-xs opacity-50"
          style={{ color: txt }}
        >
          <ArrowLeft className="w-3 h-3" />
          back
        </span>
        <span
          className="text-[8px] uppercase opacity-30"
          style={{ color: txt, letterSpacing: "0.2em" }}
        >
          {data.tags.join(" · ") || "TAGS"}
        </span>
      </div>

      {/* Left Column — Info */}
      <div
        className="flex flex-col justify-center overflow-hidden"
        style={{
          width: hasImage ? "46%" : "60%",
          padding: "48px 24px 36px 36px",
        }}
      >
        <h1
          className="font-normal leading-tight mb-4"
          style={{
            fontSize: "clamp(1.3rem, 2.2vw, 2rem)",
            letterSpacing: "-0.02em",
            color: txt,
          }}
        >
          {data.title || "Pillar Title"}
        </h1>

        <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
          {/* Description + Details + Button */}
          <div className="flex-1" style={{ maxWidth: "240px" }}>
            <p className="text-xs leading-relaxed opacity-70 mb-1.5">
              {data.description || "Short description..."}
            </p>
            <p className="text-xs leading-relaxed opacity-70 mb-3">
              {data.details || "Full details..."}
            </p>
            {data.launchUrl && (
              <a
                href={data.launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full text-[9px] font-bold uppercase no-underline shadow-md"
                style={{
                  backgroundColor: "#fff",
                  color: accent,
                  padding: "8px 18px",
                  letterSpacing: "0.14em",
                }}
              >
                <span
                  className="shrink-0 rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    backgroundColor: accent,
                  }}
                />
                Visit Website
                <ExternalLink className="w-2.5 h-2.5 opacity-40" />
              </a>
            )}
          </div>

          {/* Services */}
          {data.services.filter(Boolean).length > 0 && (
            <div className="shrink-0" style={{ width: "130px" }}>
              <h3
                className="text-[8px] font-bold uppercase mb-1.5"
                style={{ letterSpacing: "0.18em", color: accent }}
              >
                Services
              </h3>
              <ul className="list-none p-0 m-0 text-[10px] leading-relaxed opacity-70">
                {data.services.filter(Boolean).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Right Column — Hero Image */}
      <div
        className="flex items-center"
        style={{
          width: hasImage ? "54%" : "40%",
          padding: "12px 18px 12px 0",
        }}
      >
        {hasImage ? (
          <div
            className="w-full h-full relative overflow-hidden"
            style={{
              borderRadius: "10px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            }}
          >
            <img
              src={data.image}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center border border-dashed"
            style={{
              borderColor: `${txt}20`,
              color: `${txt}40`,
            }}
          >
            <span className="text-xs">No image uploaded</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CONTENT BLOCK PANEL — mirrors the public site's RichTextBlock
// ════════════════════════════════════════════════════════════════════

function ContentBlockPanel({
  block,
  index,
}: {
  block: ContentBlock;
  index: number;
}) {
  const isLight = block.theme === "light";
  const panelBg = isLight ? "#f0ece6" : "#0d0d12";
  const panelTxt = isLight ? "#1a1a1a" : "#f5f5f5";
  const mutedColor = isLight ? "rgba(26,26,26,0.55)" : "rgba(255,255,255,0.55)";
  const isEmpty = !block.heading && !block.body && !block.image;

  return (
    <div
      className="shrink-0 flex items-center justify-center relative"
      style={{
        width: "820px",
        height: "520px",
        backgroundColor: panelBg,
        color: panelTxt,
        padding: "0 60px",
        gap: "36px",
      }}
    >
      {/* Panel number badge */}
      <div
        className="absolute top-3 left-4 text-[9px] font-mono px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: isLight
            ? "rgba(0,0,0,0.06)"
            : "rgba(255,255,255,0.06)",
          color: mutedColor,
        }}
      >
        Block {index + 1} · {block.theme || "dark"}
      </div>

      {isEmpty ? (
        <div
          className="flex flex-col items-center justify-center gap-2 text-center"
          style={{ color: mutedColor }}
        >
          <span className="text-sm opacity-50">Empty block</span>
          <span className="text-[10px] opacity-30">
            Add heading, body, or image
          </span>
        </div>
      ) : (
        <>
          {/* Text side */}
          <div className="flex-1" style={{ maxWidth: "380px" }}>
            {block.heading && (
              <h3
                className="font-bold mb-4"
                style={{
                  fontSize: "1.5rem",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                }}
              >
                {block.heading}
              </h3>
            )}
            {block.body && (
              <div
                className="text-xs leading-relaxed"
                style={{ color: mutedColor }}
                dangerouslySetInnerHTML={{ __html: block.body }}
              />
            )}
          </div>

          {/* Image side */}
          {block.image && (
            <div
              className="overflow-hidden"
              style={{
                width: "38%",
                aspectRatio: "4/5",
                borderRadius: "10px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <img
                src={block.image}
                alt={block.heading || `Block ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
