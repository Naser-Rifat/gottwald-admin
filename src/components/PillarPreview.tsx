import type { ContentBlock, PillarTheme } from "../lib/types/pillar";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

// ─── Design tokens matching public site (PillarDetailClient.tsx) ──────────────
const GOLD = "#d4af37";
const BG_DARK = "#000000";
const BG_PANEL = "#0a0a0e";
const BG_LIGHT = "#f5f0eb";
const TXT_LIGHT = "#f5f5f5";
const TXT_MUTED = "rgba(255,255,255,0.8)";
const TXT_DARK = "#1c1d21";
const TXT_DARK_MUTED = "rgba(28,29,33,0.5)";
const BORDER_DARK = "rgba(212,175,55,0.12)";
const BORDER_LIGHT = "rgba(28,29,33,0.08)";

interface PillarPreviewData {
  title: string;
  slug: string;
  description: string;
  details: string;
  tags: string[];
  services: string[];
  image: string;
  launchUrl: string;
  theme: PillarTheme;
  contentBlocks: ContentBlock[];
}

interface PillarPreviewProps {
  data: PillarPreviewData;
  visible: boolean;
  onToggle: () => void;
}

export default function ProjectPreview({
  data,
  visible,
  onToggle,
}: PillarPreviewProps) {
  const { contentBlocks } = data;

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
          {/* Horizontal scroll container */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin">
            <div
              className="flex"
              style={{ minWidth: `${(2 + contentBlocks.length) * 820}px` }}
            >
              {/* ═══ PANEL 1 — Hero ═══ */}
              <HeroPanel data={data} />

              {/* ═══ Content Block Panels ═══ */}
              {contentBlocks.map((block, i) => (
                <ContentBlockPanel
                  key={block.id || i}
                  block={block}
                  index={i + 1}
                  data={data}
                />
              ))}

              {/* ═══ Last Panel — Return ═══ */}
              <LastPanel />
            </div>
          </div>

          {/* Info Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-t border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-600">
              {2 + contentBlocks.length} panel
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

// ═══════════════════════════════════════════════════════════════════
// SHARED: ImageFallback — premium dark gradient matching public site
// ═══════════════════════════════════════════════════════════════════

function ImageFallback({ idx }: { idx: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, #08090e 0%, #0c1020 35%, #0a0e18 65%, #060810 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(212,175,55,.12) 2px, rgba(212,175,55,.12) 3px)",
          backgroundSize: "8px 8px",
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: 0.04 }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "8rem",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            color: TXT_LIGHT,
          }}
        >
          {String(idx + 1).padStart(2, "0")}
        </span>
      </div>
      <div
        className="absolute inset-0"
        style={{
          border: "1px solid rgba(212,175,55,0.05)",
          borderRadius: "10px",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SHARED: SectionLabel — "• 01 — CATEGORY" matching public site
// ═══════════════════════════════════════════════════════════════════

function SectionLabel({
  idx,
  text,
  light,
}: {
  idx: number;
  text: string;
  light?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: light ? TXT_DARK : GOLD,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontSize: "9px",
          letterSpacing: "0.25em",
          textTransform: "uppercase" as const,
          fontWeight: 600,
          color: light ? TXT_DARK_MUTED : TXT_MUTED,
        }}
      >
        {String(idx + 1).padStart(2, "0")} — {text}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PANEL 1 — Hero — mirrors PillarDetailClient Hero section exactly
// ═══════════════════════════════════════════════════════════════════

function HeroPanel({ data }: { data: PillarPreviewData }) {
  const hasImage = !!data.image;

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{
        width: "820px",
        height: "520px",
        backgroundColor: BG_DARK,
        color: TXT_LIGHT,
        position: "relative",
      }}
    >
      {/* Top nav — matches public site nav */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 36px",
          zIndex: 10,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            opacity: 0.5,
            color: TXT_LIGHT,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "18px",
              height: "1px",
              backgroundColor: TXT_LIGHT,
              opacity: 0.6,
            }}
          />
          <ArrowLeft style={{ width: "10px", height: "10px" }} />
          Back
        </span>
        {data.tags.length > 0 && (
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.25em",
              textTransform: "uppercase" as const,
              fontWeight: 500,
              color: GOLD,
              opacity: 0.8,
            }}
          >
            {data.tags.join(" · ")}
          </span>
        )}
      </div>

      {/* Main content row */}
      <div style={{ display: "flex", flex: 1, marginTop: "52px" }}>
        {/* Left — text */}
        <div
          style={{
            width: hasImage ? "46%" : "60%",
            padding: "20px 24px 28px 36px",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Section label */}
          <SectionLabel
            idx={0}
            text={data.tags[0] || "Pillar"}
            light={false}
          />

          {/* Title — serif, large, matching public */}
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              marginBottom: "20px",
              color: TXT_LIGHT,
            }}
          >
            {data.title || "Pillar Title"}
          </h1>

          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            {/* Description + Details + CTA */}
            <div style={{ flex: 1, maxWidth: "220px" }}>
              <div
                style={{
                  maxHeight: "140px",
                  overflowY: "auto",
                  scrollbarWidth: "thin" as const,
                  scrollbarColor: "rgba(255,255,255,0.12) transparent",
                  marginBottom: "12px",
                }}
              >
                {data.description && (
                  <p
                    style={{
                      fontSize: "11px",
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 300,
                      marginBottom: "8px",
                    }}
                  >
                    {data.description}
                  </p>
                )}
                {data.details && data.details !== data.description && (
                  <p
                    style={{
                      fontSize: "10px",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.55)",
                      fontWeight: 300,
                    }}
                  >
                    {data.details}
                  </p>
                )}
              </div>

              {/* CTA — gold bordered rectangle matching public site */}
              {data.launchUrl && (
                <a
                  href={data.launchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 20px",
                    border: `1px solid rgba(212,175,55,0.5)`,
                    color: GOLD,
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase" as const,
                    textDecoration: "none",
                  }}
                >
                  Visit Website
                  <span style={{ fontSize: "10px" }}>→</span>
                </a>
              )}
            </div>

            {/* Services — with gold bullet dots matching public site */}
            {data.services.filter(Boolean).length > 0 && (
              <div style={{ width: "120px", flexShrink: 0 }}>
                <h3
                  style={{
                    fontSize: "7px",
                    letterSpacing: "0.45em",
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    color: GOLD,
                    marginBottom: "8px",
                  }}
                >
                  Services
                </h3>
                <div
                  style={{
                    width: "32px",
                    height: "1px",
                    backgroundColor: "rgba(212,175,55,0.35)",
                    marginBottom: "10px",
                  }}
                />
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: "6px",
                  }}
                >
                  {data.services.filter(Boolean).map((s, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                        fontSize: "9px",
                        color: "rgba(255,255,255,0.70)",
                        fontWeight: 300,
                        lineHeight: 1.5,
                      }}
                    >
                      {/* Gold bullet dot */}
                      <span
                        style={{
                          width: "3px",
                          height: "3px",
                          borderRadius: "50%",
                          backgroundColor: GOLD,
                          opacity: 0.7,
                          flexShrink: 0,
                          marginTop: "4px",
                          display: "inline-block",
                        }}
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right — Hero Image */}
        <div
          style={{
            width: hasImage ? "54%" : "40%",
            padding: "8px 16px 20px 8px",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 16px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.04)",
            }}
          >
            {/* Premium fallback (always shown underneath image) */}
            <ImageFallback idx={0} />

            {/* Gold accent details */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "2px",
                height: "100%",
                background: "linear-gradient(to bottom, rgba(212,175,55,0.4), rgba(212,175,55,0.1), transparent)",
                zIndex: 5,
              }}
            />
            {/* Index watermark */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                zIndex: 5,
                mixBlendMode: "screen" as const,
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.12)",
                  fontFamily: "Georgia, serif",
                  fontSize: "3.5rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                01
              </span>
            </div>

            {hasImage && (
              <img
                src={data.image}
                alt={data.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 10,
                }}
              />
            )}

            {/* Bottom gradient overlay */}
            {hasImage && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)",
                  zIndex: 15,
                }}
              />
            )}

            {/* Pillar label at bottom */}
            <div
              style={{
                position: "absolute",
                bottom: "14px",
                left: "14px",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(212,175,55,0.5)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "7px",
                  letterSpacing: "0.3em",
                  color: "rgba(255,255,255,0.55)",
                  textTransform: "uppercase" as const,
                  fontWeight: 500,
                }}
              >
                Pillar 01
              </span>
            </div>

            {/* Top-right corner bracket */}
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "18px",
                height: "18px",
                borderTop: "1px solid rgba(255,255,255,0.2)",
                borderRight: "1px solid rgba(255,255,255,0.2)",
                zIndex: 20,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTENT BLOCK PANEL — mirrors RichTextBlock / CaseStudyBlock etc.
// ═══════════════════════════════════════════════════════════════════

function ContentBlockPanel({
  block,
  index,
  data,
}: {
  block: ContentBlock;
  index: number;
  data: PillarPreviewData;
}) {
  const isLight = block.theme === "light";
  const panelBg = isLight ? BG_LIGHT : BG_PANEL;
  const panelTxt = isLight ? TXT_DARK : TXT_LIGHT;
  const mutedColor = isLight ? TXT_DARK_MUTED : TXT_MUTED;
  const borderColor = isLight ? BORDER_LIGHT : BORDER_DARK;
  const hasBlockImage = !!block.image;
  const hasHeroImage = !!data.image;
  const displayImage = block.image || data.image;
  const isEmpty = !block.heading && !block.body && !block.image;

  return (
    <div
      className="shrink-0 flex"
      style={{
        width: "820px",
        height: "520px",
        backgroundColor: panelBg,
        color: panelTxt,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isEmpty ? (
        /* Empty block state */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: mutedColor,
          }}
        >
          <span style={{ fontSize: "13px", opacity: 0.5 }}>Empty block</span>
          <span style={{ fontSize: "10px", opacity: 0.3 }}>
            Add heading, body, or image
          </span>
        </div>
      ) : (
        <>
          {/* Text side — matches public site layout */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column" as const,
              justifyContent: "center",
              padding: "40px 48px",
              overflow: "hidden",
              maxWidth: hasBlockImage || hasHeroImage ? "55%" : "100%",
            }}
          >
            {/* Section label — matches public SectionLabel */}
            <SectionLabel
              idx={index}
              text={block.heading ? block.heading.slice(0, 20) : "Detail"}
              light={isLight}
            />

            {/* Serif heading — matches public site font */}
            {block.heading && (
              <h3
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  marginBottom: "20px",
                  color: panelTxt,
                }}
              >
                {block.heading}
              </h3>
            )}

            {/* Body — rendered as HTML matching public prose style */}
            {block.body && (
              <div
                style={{
                  fontSize: "12px",
                  lineHeight: 1.8,
                  color: mutedColor,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 8,
                  WebkitBoxOrient: "vertical" as const,
                }}
                dangerouslySetInnerHTML={{ __html: block.body }}
              />
            )}
          </div>

          {/* Image side — matches public CaseStudyBlock right column */}
          {displayImage && (
            <div
              style={{
                width: "38%",
                flexShrink: 0,
                borderLeft: `1px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4/5",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
                }}
              >
                <ImageFallback idx={index} />
                <img
                  src={displayImage}
                  alt={block.heading || `Block ${index + 1}`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: 10,
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Gold progress bar at bottom — matching public site accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "rgba(212,175,55,0.08)",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LAST PANEL — mirrors the "Return" / "Back to Home" panel
// ═══════════════════════════════════════════════════════════════════

function LastPanel() {
  return (
    <div
      className="shrink-0 flex items-end"
      style={{
        width: "820px",
        height: "520px",
        backgroundColor: BG_LIGHT,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row" as const,
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "0 48px 56px 48px",
          gap: "24px",
        }}
      >
        {/* Left — title CTA */}
        <div>
          <span
            style={{
              display: "block",
              fontSize: "8px",
              letterSpacing: "0.3em",
              textTransform: "uppercase" as const,
              fontWeight: 600,
              color: TXT_DARK_MUTED,
              marginBottom: "12px",
            }}
          >
            Return
          </span>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(2.5rem, 8vw, 6rem)",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              paddingBottom: "8px",
              color: "rgba(28,29,33,0.35)",
            }}
          >
            GOTT WALD
          </h2>
        </div>

        {/* Right — Back to Home arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: "0.25em",
              textTransform: "uppercase" as const,
              color: "rgba(28,29,33,0.6)",
            }}
          >
            Back to Home
          </span>
          <span
            style={{
              display: "block",
              width: "48px",
              height: "1px",
              backgroundColor: "rgba(28,29,33,0.35)",
            }}
          />
          <span
            style={{ fontSize: "14px", color: "rgba(28,29,33,0.6)" }}
          >
            →
          </span>
        </div>
      </div>
    </div>
  );
}
