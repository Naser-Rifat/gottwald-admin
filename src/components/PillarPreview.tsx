/**
 * PillarPreview.tsx
 *
 * Live preview component that mirrors PillarDetailClient.tsx on the public site
 * EXACTLY — same design tokens, layout proportions, typography, and visual details.
 *
 * Source of truth: lusion-next/app/pillars/[slug]/PillarDetailClient.tsx
 */

import type { ContentBlock, Offer } from "../lib/types/pillar";
import { Eye, EyeOff } from "lucide-react";

// ─── Design tokens — MUST match PillarDetailClient.tsx exactly ────────────────
const GOLD = "#d4af37";
const BG_DARK = "#000000";
// const BG_PANEL = "#0a0a0e";
const BG_LIGHT = "#f5f0eb";
const TXT_LIGHT = "#f5f5f5";
const TXT_MUTED = "rgba(255,255,255,0.8)";
const TXT_DARK = "#1c1d21";
const TXT_DARK_MUTED = "rgba(28,29,33,0.5)";
// const BORDER_DARK = "rgba(212,175,55,0.12)";
// const BORDER_LIGHT = "rgba(28,29,33,0.08)";

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.length === 3 ? cleanHex[0] + cleanHex[0] : cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.length === 3 ? cleanHex[1] + cleanHex[1] : cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.length === 3 ? cleanHex[2] + cleanHex[2] : cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Preview panel dimensions (scaled down from full viewport)
const PANEL_W = 860;
const PANEL_H = 540;

interface PillarPreviewData {
  title: string;
  slug: string;
  description: string;
  details: string;
  tags: string[];
  services: string[];
  image: string;
  launchUrl: string;
  theme: { background: string; text: string; accent: string };
  contentBlocks: ContentBlock[];
  offers: Offer[];
}

interface PillarPreviewProps {
  data: PillarPreviewData;
  visible: boolean;
  onToggle: () => void;
}

export default function PillarPreview({
  data,
  visible,
  onToggle,
}: PillarPreviewProps) {
  const { contentBlocks } = data;
  const hasOffers = (data.offers?.length ?? 0) > 0;
  const totalPanels = 2 + contentBlocks.length + (hasOffers ? 1 : 0); // hero + offers? + blocks + last

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
          {/* Horizontal scroll — mirrors the desktop horizontal scroll of the public site */}
          <div className="overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: "thin" }}>
            <div
              className="flex"
              style={{ minWidth: `${totalPanels * PANEL_W}px` }}
            >
              {/* Panel 1 — Hero */}
              <HeroPanel data={data} totalPanels={totalPanels} projectTheme={data.theme} />

              {/* Offers panel — mirrors public site offers block */}
              {hasOffers && (
                <OffersPanel
                  offers={data.offers}
                  panelIdx={1}
                  totalPanels={totalPanels}
                  projectTheme={data.theme}
                />
              )}

              {/* Dynamic content block panels */}
              {contentBlocks.map((block, i) => (
                <ContentBlockPanel
                  key={block.id || i}
                  block={block}
                  panelIdx={i + (hasOffers ? 2 : 1)}
                  totalPanels={totalPanels}
                  projectImage={data.image}
                  projectTheme={data.theme}
                />
              ))}

              {/* Last Panel — Return home */}
              <LastPanel
                nextSlug={contentBlocks.length > 0 ? data.slug : null}
                panelIdx={totalPanels - 1}
                totalPanels={totalPanels}
                projectTheme={data.theme}
              />
            </div>
          </div>

          {/* Info bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-t border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-600">
              {totalPanels} panels · horizontal scroll →
            </span>
            <span className="text-[10px] text-zinc-600">Scroll to preview all</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════

/** Exact copy of ImageFallback from PillarDetailClient */
function ImageFallback({ idx }: { idx: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(145deg, #08090e 0%, #0c1020 35%, #0a0e18 65%, #060810 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(212,175,55,.15) 2px, rgba(212,175,55,.15) 3px)",
          backgroundSize: "8px 8px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.03,
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "7rem",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            color: TXT_LIGHT,
          }}
        >
          {String(idx + 1).padStart(2, "0")}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: "1px solid rgba(212,175,55,0.06)",
          borderRadius: "12px",
        }}
      />
    </div>
  );
}

/** Exact copy of SectionLabel from PillarDetailClient */
function SectionLabel({
  idx,
  text,
  light,
  accentHex,
}: {
  idx: number;
  text: string;
  light?: boolean;
  accentHex?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "24px",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: light ? TXT_DARK : (accentHex || GOLD),
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontSize: "10px",
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

/** Panel counter — "01 / 03" bottom right, matching PillarDetailClient */
function PanelCounter({
  idx,
  total,
  light,
  accentHex,
}: {
  idx: number;
  total: number;
  light?: boolean;
  accentHex?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "24px",
        right: "28px",
        fontSize: "11px",
        letterSpacing: "0.25em",
        textTransform: "uppercase" as const,
        fontWeight: 500,
        color: light ? TXT_DARK_MUTED : TXT_MUTED,
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <span style={{ color: accentHex || GOLD }}>{String(idx + 1).padStart(2, "0")}</span>
      <span style={{ opacity: 0.3, margin: "0 2px" }}>/</span>
      {String(total).padStart(2, "0")}
    </div>
  );
}

function TopNav({ tags, accentHex }: { tags: string[]; accentHex?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 48px",
        zIndex: 20,
      }}
    >
      {/* ← Back */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "11px",
          fontWeight: 500,
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
        Back
      </span>

      {/* Tags — custom accent right side */}
      {tags.length > 0 && (
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.25em",
            textTransform: "uppercase" as const,
            fontWeight: 500,
            color: accentHex || GOLD,
            opacity: 0.8,
          }}
        >
          {tags.join(" · ")}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PANEL 1 — HERO
// Mirrors lines 283–529 of PillarDetailClient.tsx exactly
// ═══════════════════════════════════════════════════════════════════════

function HeroPanel({
  data,
  totalPanels,
  projectTheme,
}: {
  data: PillarPreviewData;
  totalPanels: number;
  projectTheme: { background: string; text: string; accent: string };
}) {
  const hasImage = !!data.image;
  const accent = projectTheme.background || GOLD;

  return (
    <div
      style={{
        width: `${PANEL_W}px`,
        height: `${PANEL_H}px`,
        backgroundColor: BG_DARK,
        color: TXT_LIGHT,
        position: "relative",
        display: "flex",
        flexDirection: "row" as const,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <TopNav tags={data.tags} accentHex={accent} />

      {/* ── Left: Text Content — 46% width like public site ── */}
      <div
        style={{
          width: "46%",
          height: "100%",
          display: "flex",
          flexDirection: "column" as const,
          justifyContent: "center",
          paddingTop: "60px",
          paddingLeft: "48px",
          paddingRight: "32px",
          paddingBottom: "28px",
          overflow: "hidden",
        }}
      >
        {/* Section label: "• 01 — TAG" */}
        <SectionLabel idx={0} text={data.tags[0] || "Pillar"} light={false} accentHex={accent} />

        {/* Title — Georgia serif, large, 400 weight */}
        <h1
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "2.4rem",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            marginBottom: "28px",
            color: TXT_LIGHT,
            paddingTop: "4px",
          }}
        >
          {data.title || "Pillar Title"}
        </h1>

        {/* Description + Services row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row" as const,
            gap: "24px",
            alignItems: "flex-start",
          }}
        >
          {/* Description + CTA */}
          <div style={{ flex: 1, maxWidth: "220px" }}>
            <div
              style={{
                maxHeight: "130px",
                overflowY: "auto",
                scrollbarWidth: "thin" as const,
                scrollbarColor: "rgba(255,255,255,0.12) transparent",
                marginBottom: "16px",
              }}
            >
              {data.description && data.description !== data.title && (
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 300,
                    marginBottom: "8px",
                  }}
                >
                  {data.description}
                </p>
              )}
              {data.details &&
                data.details !== data.description &&
                data.details !== data.title && (
                  <p
                    style={{
                      fontSize: "11px",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.80)",
                      fontWeight: 300,
                    }}
                  >
                    {data.details}
                  </p>
                )}
            </div>

            {/* CTA — gold bordered rectangle, NOT rounded pill */}
            {data.launchUrl && (
              <a
                href={data.launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 22px",
                  border: `1px solid ${hexToRgba(accent, 0.5)}`,
                  color: accent,
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase" as const,
                  textDecoration: "none",
                }}
              >
                Visit Website
                <span style={{ fontSize: "11px" }}>→</span>
              </a>
            )}
          </div>

          {/* Services — gold bullet dots + gold "SERVICES" heading */}
          {data.services.filter(Boolean).length > 0 && (
            <div style={{ flexShrink: 0, width: "130px", paddingTop: "2px" }}>
              <h3
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.45em",
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  color: accent,
                  marginBottom: "8px",
                  marginTop: 0,
                }}
              >
                Services
              </h3>
              <div
                style={{
                  width: "36px",
                  height: "1px",
                  backgroundColor: hexToRgba(accent, 0.35),
                  marginBottom: "12px",
                }}
              />
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: "8px",
                }}
              >
                {data.services.filter(Boolean).map((s, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      fontSize: "10px",
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 300,
                    }}
                  >
                    {/* Gold bullet dot — matches public site */}
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        backgroundColor: accent,
                        opacity: 0.7,
                        flexShrink: 0,
                        display: "inline-block",
                        marginTop: "5px",
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

      {/* ── Right: Hero Image — 54% width like public site ── */}
      <div
        style={{
          width: "54%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          padding: "12px 16px 20px 8px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 20px 80px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.04)",
          }}
        >
          {/* Premium dark fallback — always shown behind image */}
          <ImageFallback idx={0} />

          {/* Diagonal texture overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.025,
              backgroundImage:
                `repeating-linear-gradient(135deg, transparent, transparent 2px, ${hexToRgba(accent, 0.15)} 2px, ${hexToRgba(accent, 0.15)} 3px)`,
              backgroundSize: "8px 8px",
              zIndex: 1,
            }}
          />

          {/* Gold ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                border: `1px solid ${accent}`,
                opacity: 0.03,
              }}
            />
          </div>

          {/* Actual image */}
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

          {/* Gold edge glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "1px solid rgba(212,175,55,0.06)",
              borderRadius: "12px",
              zIndex: 20,
              pointerEvents: "none",
            }}
          />

          {/* Pillar label at bottom — matching public site */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              zIndex: 25,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor: hexToRgba(accent, 0.5),
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "8px",
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
              top: "16px",
              right: "16px",
              width: "20px",
              height: "20px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              borderRight: "1px solid rgba(255,255,255,0.2)",
              zIndex: 25,
            }}
          />
        </div>
      </div>

      {/* Gold progress bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: hexToRgba(accent, 0.1),
          zIndex: 50,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(1 / totalPanels) * 100}%`,
            backgroundColor: accent,
          }}
        />
      </div>

      {/* Panel counter */}
      <PanelCounter idx={0} total={totalPanels} accentHex={accent} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// OFFERS PANEL — mirrors public OffersBlock (scaled)
// ═══════════════════════════════════════════════════════════════════════

function OffersPanel({
  offers,
  panelIdx,
  totalPanels,
  projectTheme,
}: {
  offers: Offer[];
  panelIdx: number;
  totalPanels: number;
  projectTheme: { background: string; text: string; accent: string };
}) {
  const accentHex = projectTheme.accent || GOLD;

  const TIER_CONFIG = {
    copper: {
      accent: "#c07840",
      border: "rgba(192,120,64,0.35)",
      borderHover: "rgba(192,120,64,0.70)",
      shadow: "0 12px 48px rgba(192,120,64,0.2), 0 0 0 1px rgba(192,120,64,0.12)",
      badgeBg: "rgba(192,120,64,0.12)",
      label: "Copper",
    },
    silver: {
      accent: "#b8c0cc",
      border: "rgba(184,192,204,0.30)",
      borderHover: "rgba(184,192,204,0.65)",
      shadow: "0 12px 48px rgba(184,192,204,0.15), 0 0 0 1px rgba(184,192,204,0.1)",
      badgeBg: "rgba(184,192,204,0.10)",
      label: "Silver",
    },
    gold: {
      accent: "#d4af37",
      border: "rgba(212,175,55,0.40)",
      borderHover: "rgba(212,175,55,0.80)",
      shadow: "0 12px 48px rgba(212,175,55,0.25), 0 0 0 1px rgba(212,175,55,0.15)",
      badgeBg: "rgba(212,175,55,0.12)",
      label: "Gold",
    },
  } as const;

  const renderFeatures = (desc: string): string[] => {
    const s = (desc || "").trim();
    if (!s) return [];
    if (s.includes("\n")) return s.split("\n").map((x) => x.trim()).filter(Boolean);
    return s
      .split(". ")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => (x.endsWith(".") ? x : `${x}.`));
  };

  const tierOrder: Offer["tier"][] = ["copper", "silver", "gold"];
  const offersByTier = new Map<Offer["tier"], Offer>();
  for (const o of offers) {
    if (!offersByTier.has(o.tier)) offersByTier.set(o.tier, o);
  }
  const cards: Array<{ tier: Offer["tier"]; offer?: Offer }> = tierOrder.map((tier) => ({
    tier,
    offer: offersByTier.get(tier),
  }));

  return (
    <div
      style={{
        width: `${PANEL_W}px`,
        height: `${PANEL_H}px`,
        backgroundColor: BG_DARK,
        position: "relative",
        display: "flex",
        flexShrink: 0,
        overflow: "hidden",
        padding: "28px",
      }}
    >
      {/* Atmosphere */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(circle at top, ${hexToRgba(accentHex, 0.05)} 0%, transparent 55%)`,
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "28px",
          border: `1px solid ${hexToRgba(TXT_LIGHT, 0.06)}`,
          background: "rgba(5, 8, 12, 0.62)",
          boxShadow: "0 20px 70px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column" as const,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "26px 30px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: accentHex,
                boxShadow: `0 0 10px ${hexToRgba(accentHex, 0.65)}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                fontWeight: 800,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {String(panelIdx + 1).padStart(2, "0")} — Strategic Offers
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
            <h3
              style={{
                fontFamily: "var(--font-serif), Georgia, serif",
                fontSize: "2.2rem",
                fontWeight: 500,
                margin: 0,
                color: TXT_LIGHT,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              Engagement Matrix
            </h3>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingBottom: "6px" }}>
              {(["copper", "silver", "gold"] as const).map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: TIER_CONFIG[t].accent,
                      boxShadow: `0 0 10px ${hexToRgba(TIER_CONFIG[t].accent, 0.55)}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      fontWeight: 800,
                      color: TIER_CONFIG[t].accent,
                    }}
                  >
                    {TIER_CONFIG[t].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cards grid (scaled down from public) */}
        <div
          style={{
            padding: "16px 22px 22px",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "16px",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {cards.map(({ tier, offer }, idx) => {
            const key = (tier in TIER_CONFIG ? tier : "gold") as keyof typeof TIER_CONFIG;
            const tc = TIER_CONFIG[key];
            const isCenter = idx === 1;
            const features = renderFeatures(offer?.description || "");
            const isEmpty = !offer;

            return (
              <div
                key={`${tier}-${idx}`}
                style={{
                  minWidth: 0,
                  borderRadius: "28px",
                  overflow: "hidden",
                  position: "relative",
                  border: `1px solid ${isCenter ? tc.borderHover : tc.border}`,
                  backgroundColor: isEmpty ? "rgba(5, 8, 12, 0.38)" : "rgba(5, 8, 12, 0.56)",
                  boxShadow: isCenter
                    ? `0 22px 80px -18px ${hexToRgba(tc.accent, 0.55)}`
                    : "0 12px 44px -20px rgba(0,0,0,0.75)",
                  transform: isCenter ? "translateY(-10px) scale(1.03)" : "translateY(4px)",
                  opacity: isEmpty ? 0.55 : isCenter ? 1 : 0.9,
                }}
              >
                {/* Header plate */}
                <div
                  style={{
                    padding: "22px 18px 34px",
                    backgroundColor: "rgba(2, 4, 8, 0.40)",
                    clipPath: "polygon(0 0, 100% 0, 100% 86%, 50% 100%, 0 86%)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "1px",
                      background: `linear-gradient(90deg, transparent, ${hexToRgba(tc.accent, 0.75)}, transparent)`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(ellipse at top, ${hexToRgba(tc.accent, 0.25)} 0%, transparent 70%)`,
                      opacity: 0.55,
                      pointerEvents: "none",
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    <span
                      style={{
                        fontSize: "9px",
                        letterSpacing: "0.30em",
                        textTransform: "uppercase",
                        fontWeight: 800,
                        color: tc.accent,
                        padding: "8px 14px",
                        borderRadius: "999px",
                        backgroundColor: "rgba(0,0,0,0.45)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {tc.label} Pack
                    </span>
                  </div>

                  <h4
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-serif), Georgia, serif",
                      fontSize: "18px",
                      fontWeight: 600,
                      lineHeight: 1.15,
                      color: TXT_LIGHT,
                      textAlign: "center",
                      padding: "0 10px",
                      textShadow: "0 2px 18px rgba(0,0,0,0.6)",
                      minHeight: "44px",
                    }}
                  >
                    {offer?.title || "Add offer"}
                  </h4>
                </div>

                {/* Body */}
                <div style={{ padding: "16px 18px 18px", marginTop: "-14px", height: "calc(100% - 120px)", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                      {(features.length ? features : ["Offer description"]).slice(0, 5).map((f, fIdx) => (
                        <li key={fIdx} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "999px",
                              border: `1px solid ${hexToRgba(tc.accent, 0.70)}`,
                              color: tc.accent,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(0,0,0,0.18)",
                              flexShrink: 0,
                              marginTop: "1px",
                              boxShadow: "inset 0 0 10px rgba(0,0,0,0.55)",
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          <span style={{ fontSize: "11px", lineHeight: 1.55, color: "rgba(255,255,255,0.88)" }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deliverable + CTA */}
                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ display: "block", fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 800, color: tc.accent }}>
                        Deliverable
                      </span>
                      <span style={{ display: "block", marginTop: "6px", fontSize: "11px", lineHeight: 1.45, color: "rgba(255,255,255,0.92)" }}>
                        {offer?.deliverable || "Deliverable"}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled
                      style={{
                        marginTop: "12px",
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "999px",
                        border: `1px solid ${hexToRgba(tc.accent, 0.55)}`,
                        background: `linear-gradient(90deg, ${hexToRgba(tc.accent, 0.28)} 0%, ${hexToRgba(tc.accent, 0.10)} 100%)`,
                        color: TXT_LIGHT,
                        fontSize: "10px",
                        fontWeight: 800,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        cursor: "not-allowed",
                        opacity: isEmpty ? 0.55 : 1,
                      }}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gold progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: hexToRgba(accentHex, 0.1),
          zIndex: 50,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((panelIdx + 1) / totalPanels) * 100}%`,
            backgroundColor: accentHex,
          }}
        />
      </div>

      <PanelCounter idx={panelIdx} total={totalPanels} accentHex={accentHex} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CONTENT BLOCK PANELS
// Mirrors RichTextBlock / CaseStudyBlock / FeatureBlock from PillarDetailClient
// ═══════════════════════════════════════════════════════════════════════

function ContentBlockPanel({
  block,
  panelIdx,
  totalPanels,
  projectImage,
  projectTheme,
}: {
  block: ContentBlock;
  panelIdx: number;
  totalPanels: number;
  projectImage: string;
  projectTheme: { background: string; text: string; accent: string };
}) {
  const isLight = block.theme === "light";
  const bgHex = isLight ? projectTheme.text : projectTheme.background;
  const txtHex = isLight ? projectTheme.background : projectTheme.text;
  const accentHex = projectTheme.accent;

  const displayImage = block.image || projectImage;
  const isEmpty = !block.heading && !block.body && !block.image;

  return (
    <div
      style={{
        width: `${PANEL_W}px`,
        height: `${PANEL_H}px`,
        backgroundColor: BG_DARK,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        padding: "32px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "760px",
          backgroundColor: hexToRgba(bgHex, 0.9),
          color: txtHex,
          display: "flex",
          flexDirection: "row" as const,
          borderRadius: "24px",
          border: `1px solid ${hexToRgba(txtHex, 0.08)}`,
          boxShadow: `0 20px 60px -10px ${hexToRgba(bgHex, 0.5)}`,
          overflow: "hidden",
        }}
      >
        {isEmpty ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: hexToRgba(txtHex, 0.5),
            }}
          >
            <span style={{ fontSize: "13px" }}>Empty block</span>
            <span style={{ fontSize: "10px", opacity: 0.6 }}>
              Add heading, body, or image
            </span>
          </div>
        ) : (
          <>
            {/* Text — left side, same proportions as CaseStudyBlock */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column" as const,
                justifyContent: "center",
                padding: "40px",
                overflowY: "auto",
              }}
            >
              {/* Section label */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: accentHex, flexShrink: 0, boxShadow: `0 0 6px ${hexToRgba(accentHex, 0.6)}` }} />
                <span style={{ fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, color: hexToRgba(txtHex, 0.7) }}>
                  {String(panelIdx + 1).padStart(2, "0")} — {block.heading ? block.heading.slice(0, 22) : "Detail"}
                </span>
              </div>

              {/* Heading — Style varies by block type */}
              {block.heading && (
                <h3
                  style={{
                    fontFamily: "var(--font-serif), Georgia, serif",
                    fontSize: "2rem",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    marginBottom: "20px",
                    color: block.type === "feature" ? "transparent" : txtHex,
                    WebkitTextStroke: block.type === "feature" ? `1px ${hexToRgba(txtHex, 0.9)}` : undefined,
                    marginTop: 0,
                  }}
                >
                  {block.heading}
                </h3>
              )}

              {/* Body */}
              {block.body && (
                <div
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.85,
                    color: hexToRgba(txtHex, 0.8),
                  }}
                  dangerouslySetInnerHTML={{ __html: block.body }}
                />
              )}
            </div>

            {/* Image — right side with border */}
            {displayImage && (
              <div
                style={{
                  width: "42%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "stretch",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: `0 16px 40px ${hexToRgba(bgHex, 0.4)}`,
                  }}
                >
                  <ImageFallback idx={panelIdx} />
                  <img
                    src={displayImage}
                    alt={block.heading || `Block ${panelIdx + 1}`}
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
      </div>

      {/* Gold progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: isLight ? "rgba(28,29,33,0.08)" : "rgba(212,175,55,0.08)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((panelIdx + 1) / totalPanels) * 100}%`,
            backgroundColor: isLight ? TXT_DARK : accentHex,
          }}
        />
      </div>

      {/* Panel counter */}
      <PanelCounter idx={panelIdx} total={totalPanels} light={isLight} accentHex={accentHex} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LAST PANEL — mirrors the "Return → GOTT WALD" panel
// ═══════════════════════════════════════════════════════════════════════

function LastPanel({
  panelIdx,
  totalPanels,
  projectTheme,
}: {
  nextSlug: string | null;
  panelIdx: number;
  totalPanels: number;
  projectTheme: { background: string; text: string; accent: string };
}) {
  const accent = projectTheme.accent || GOLD;

  return (
    <div
      style={{
        width: `${PANEL_W}px`,
        height: `${PANEL_H}px`,
        backgroundColor: BG_LIGHT,
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        flexShrink: 0,
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
          padding: "0 48px 56px",
          gap: "24px",
        }}
      >
        {/* Left — "Return → GOTT WALD" title */}
        <div>
          <span
            style={{
              display: "block",
              fontSize: "9px",
              letterSpacing: "0.3em",
              textTransform: "uppercase" as const,
              fontWeight: 600,
              color: TXT_DARK_MUTED,
              marginBottom: "14px",
            }}
          >
            Return
          </span>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "5rem",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              paddingBottom: "10px",
              color: "rgba(28,29,33,0.35)",
              margin: 0,
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
              fontSize: "9px",
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
          <span style={{ fontSize: "16px", color: "rgba(28,29,33,0.6)" }}>
            →
          </span>
        </div>
      </div>

      {/* Progress bar — 100% at last panel */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "rgba(28,29,33,0.08)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: TXT_DARK,
            opacity: 0.3,
          }}
        />
      </div>

      <PanelCounter idx={panelIdx} total={totalPanels} light accentHex={accent} />
    </div>
  );
}
