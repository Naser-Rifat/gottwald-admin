import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import type {
  CoachingMatrix,
  CoachingStage,
  CoachingStageData,
  CoachingTrack,
  CoachingVariant,
  OfferCurrency,
} from "../lib/types/pillar";

const VARIANTS: CoachingVariant[] = ["business", "personal"];
const STAGES: CoachingStage[] = ["session", "intensive", "retainer"];
const CURRENCIES: OfferCurrency[] = ["EUR", "USD", "CHF", "GBP", "GEL"];

const VARIANT_LABEL: Record<CoachingVariant, string> = {
  business: "Business",
  personal: "Personal",
};

const STAGE_LABEL: Record<CoachingStage, string> = {
  session: "Session",
  intensive: "Intensive",
  retainer: "Retainer",
};

const EMPTY_STAGE: CoachingStageData = {
  title: "",
  description: "",
  deliverable: "",
  price: null,
  currency: "EUR",
};

const EMPTY_TRACK: CoachingTrack = {
  label: "",
  variants: {},
};

interface CoachingMatrixBuilderProps {
  matrix: CoachingMatrix | Record<string, never>;
  onChange: (updater: (prev: CoachingMatrix) => CoachingMatrix) => void;
}

/** Normalize an empty {} to a proper CoachingMatrix shape (with tracks={}). */
function ensureMatrix(m: CoachingMatrix | Record<string, never>): CoachingMatrix {
  if ("tracks" in m && m.tracks) return m as CoachingMatrix;
  return { tracks: {} };
}

/** Simple slug helper for track keys (e.g. "Leadership / Executive" → "leadership-executive"). */
function slugifyTrackKey(label: string): string {
  const slug = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `track-${Date.now()}`;
}

export const CoachingMatrixBuilder = ({
  matrix,
  onChange,
}: CoachingMatrixBuilderProps) => {
  const normalized = useMemo(() => ensureMatrix(matrix), [matrix]);
  const trackEntries = useMemo(
    () => Object.entries(normalized.tracks),
    [normalized.tracks],
  );

  const [openTracks, setOpenTracks] = useState<Set<string>>(new Set());
  const [openVariants, setOpenVariants] = useState<Set<string>>(new Set());
  const [openStages, setOpenStages] = useState<Set<string>>(new Set());
  const [newTrackLabel, setNewTrackLabel] = useState("");

  const toggle = (
    key: string,
    set: Set<string>,
    setSet: (s: Set<string>) => void,
  ) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSet(next);
  };

  const addTrack = () => {
    const label = newTrackLabel.trim();
    if (!label) return;
    const key = slugifyTrackKey(label);
    onChange((prev) => ({
      ...prev,
      tracks: { ...prev.tracks, [key]: { label, variants: {} } },
    }));
    setNewTrackLabel("");
    setOpenTracks((s) => new Set(s).add(key));
  };

  const removeTrack = (key: string) => {
    if (!confirm(`Remove track "${normalized.tracks[key]?.label || key}"?`))
      return;
    onChange((prev) => {
      const next = { ...prev.tracks };
      delete next[key];
      return { ...prev, tracks: next };
    });
  };

  const updateTrackLabel = (key: string, label: string) => {
    onChange((prev) => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [key]: { ...(prev.tracks[key] ?? EMPTY_TRACK), label },
      },
    }));
  };

  const ensureVariant = (trackKey: string, variant: CoachingVariant) => {
    onChange((prev) => {
      const track = prev.tracks[trackKey] ?? EMPTY_TRACK;
      if (track.variants?.[variant]) return prev;
      return {
        ...prev,
        tracks: {
          ...prev.tracks,
          [trackKey]: {
            ...track,
            variants: {
              ...track.variants,
              [variant]: { stages: {} },
            },
          },
        },
      };
    });
    setOpenVariants((s) => new Set(s).add(`${trackKey}::${variant}`));
  };

  const removeVariant = (trackKey: string, variant: CoachingVariant) => {
    onChange((prev) => {
      const track = prev.tracks[trackKey];
      if (!track) return prev;
      const nextVariants = { ...track.variants };
      delete nextVariants[variant];
      return {
        ...prev,
        tracks: {
          ...prev.tracks,
          [trackKey]: { ...track, variants: nextVariants },
        },
      };
    });
  };

  const ensureStage = (
    trackKey: string,
    variant: CoachingVariant,
    stage: CoachingStage,
  ) => {
    onChange((prev) => {
      const track = prev.tracks[trackKey] ?? EMPTY_TRACK;
      const variantData = track.variants?.[variant] ?? { stages: {} };
      if (variantData.stages?.[stage]) return prev;
      return {
        ...prev,
        tracks: {
          ...prev.tracks,
          [trackKey]: {
            ...track,
            variants: {
              ...track.variants,
              [variant]: {
                stages: { ...variantData.stages, [stage]: { ...EMPTY_STAGE } },
              },
            },
          },
        },
      };
    });
    setOpenStages((s) => new Set(s).add(`${trackKey}::${variant}::${stage}`));
  };

  const updateStage = (
    trackKey: string,
    variant: CoachingVariant,
    stage: CoachingStage,
    patch: Partial<CoachingStageData>,
  ) => {
    onChange((prev) => {
      const track = prev.tracks[trackKey] ?? EMPTY_TRACK;
      const variantData = track.variants?.[variant] ?? { stages: {} };
      const stageData = variantData.stages?.[stage] ?? EMPTY_STAGE;
      return {
        ...prev,
        tracks: {
          ...prev.tracks,
          [trackKey]: {
            ...track,
            variants: {
              ...track.variants,
              [variant]: {
                stages: {
                  ...variantData.stages,
                  [stage]: { ...stageData, ...patch },
                },
              },
            },
          },
        },
      };
    });
  };

  const removeStage = (
    trackKey: string,
    variant: CoachingVariant,
    stage: CoachingStage,
  ) => {
    onChange((prev) => {
      const track = prev.tracks[trackKey];
      if (!track?.variants?.[variant]) return prev;
      const nextStages = { ...track.variants[variant]!.stages };
      delete nextStages[stage];
      return {
        ...prev,
        tracks: {
          ...prev.tracks,
          [trackKey]: {
            ...track,
            variants: {
              ...track.variants,
              [variant]: { stages: nextStages },
            },
          },
        },
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em]">
          Coaching Matrix
        </label>
        <span className="text-xs text-zinc-500">
          {trackEntries.length} track{trackEntries.length !== 1 ? "s" : ""}
        </span>
      </div>

      {trackEntries.length === 0 && (
        <div className="border border-dashed border-zinc-800/60 rounded-xl p-10 text-center">
          <p className="text-2xl text-zinc-800 font-brand mb-2">—</p>
          <p className="text-xs font-medium text-zinc-600 uppercase tracking-[0.15em]">
            No tracks configured
          </p>
          <p className="text-sm text-zinc-700 mt-2">
            Add a thematic track (e.g. Leadership / Executive).
          </p>
        </div>
      )}

      {trackEntries.map(([trackKey, track]) => {
        const trackOpen = openTracks.has(trackKey);
        return (
          <div
            key={trackKey}
            className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden"
          >
            {/* Track header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <button
                type="button"
                onClick={() => toggle(trackKey, openTracks, setOpenTracks)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                {trackOpen ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                )}
                <span className="text-xs text-zinc-500 uppercase tracking-[0.15em]">
                  {trackKey}
                </span>
                <span className="text-base text-zinc-200 truncate">
                  {track.label || <span className="italic text-zinc-600">Untitled track</span>}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeTrack(trackKey)}
                className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                title="Remove track"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {trackOpen && (
              <div className="p-4 space-y-4">
                {/* Track label editor */}
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] block mb-1.5">
                    Track label
                  </label>
                  <input
                    type="text"
                    value={track.label}
                    onChange={(e) => updateTrackLabel(trackKey, e.target.value)}
                    placeholder="e.g. Leadership / Executive"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                {/* Variants row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {VARIANTS.map((variant) => {
                    const variantData = track.variants?.[variant];
                    const variantKey = `${trackKey}::${variant}`;
                    const variantOpen = openVariants.has(variantKey);
                    return (
                      <div
                        key={variant}
                        className="border border-zinc-800 rounded-md bg-zinc-950/40"
                      >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                          <button
                            type="button"
                            onClick={() =>
                              variantData
                                ? toggle(variantKey, openVariants, setOpenVariants)
                                : ensureVariant(trackKey, variant)
                            }
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            {variantData ? (
                              variantOpen ? (
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                              )
                            ) : (
                              <Plus className="w-3.5 h-3.5 text-zinc-500" />
                            )}
                            <span className="text-sm text-zinc-300 uppercase tracking-[0.1em]">
                              {VARIANT_LABEL[variant]}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {variantData
                                ? `${Object.keys(variantData.stages ?? {}).length} / 3 stages`
                                : "add"}
                            </span>
                          </button>
                          {variantData && (
                            <button
                              type="button"
                              onClick={() => removeVariant(trackKey, variant)}
                              className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                              title={`Remove ${VARIANT_LABEL[variant]} variant`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {variantData && variantOpen && (
                          <div className="p-3 space-y-2">
                            {STAGES.map((stage) => {
                              const stageData = variantData.stages?.[stage];
                              const stageKey = `${trackKey}::${variant}::${stage}`;
                              const stageOpen = openStages.has(stageKey);
                              return (
                                <div
                                  key={stage}
                                  className="border border-zinc-800/60 rounded bg-zinc-950/60"
                                >
                                  <div className="flex items-center justify-between px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        stageData
                                          ? toggle(stageKey, openStages, setOpenStages)
                                          : ensureStage(trackKey, variant, stage)
                                      }
                                      className="flex items-center gap-2 flex-1 text-left"
                                    >
                                      {stageData ? (
                                        stageOpen ? (
                                          <ChevronDown className="w-3 h-3 text-zinc-500" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3 text-zinc-500" />
                                        )
                                      ) : (
                                        <Plus className="w-3 h-3 text-zinc-600" />
                                      )}
                                      <span className="text-sm text-zinc-400">
                                        {STAGE_LABEL[stage]}
                                      </span>
                                      {stageData && (
                                        <span className="text-xs text-zinc-500 truncate">
                                          {stageData.title || "(untitled)"}
                                        </span>
                                      )}
                                    </button>
                                    {stageData && (
                                      <button
                                        type="button"
                                        onClick={() => removeStage(trackKey, variant, stage)}
                                        className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                                        title={`Remove ${STAGE_LABEL[stage]} stage`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  {stageData && stageOpen && (
                                    <div className="border-t border-zinc-800/60 px-3 py-3 space-y-2">
                                      <StageField
                                        label="Title"
                                        value={stageData.title}
                                        onChange={(v) =>
                                          updateStage(trackKey, variant, stage, {
                                            title: v,
                                          })
                                        }
                                        placeholder="e.g. Executive Session"
                                      />
                                      <div className="grid grid-cols-3 gap-2">
                                        <StageField
                                          className="col-span-2"
                                          label="Price"
                                          type="number"
                                          value={stageData.price ?? ""}
                                          onChange={(v) => {
                                            const num =
                                              v === "" ? null : Number(v);
                                            updateStage(trackKey, variant, stage, {
                                              price: Number.isFinite(num) ? num : null,
                                            });
                                          }}
                                          placeholder="2900"
                                        />
                                        <div>
                                          <label className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] block mb-1.5">
                                            Currency
                                          </label>
                                          <select
                                            value={stageData.currency}
                                            onChange={(e) =>
                                              updateStage(trackKey, variant, stage, {
                                                currency: e.target
                                                  .value as OfferCurrency,
                                              })
                                            }
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                                          >
                                            {CURRENCIES.map((c) => (
                                              <option key={c} value={c}>
                                                {c}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                      <StageField
                                        label="Description"
                                        value={stageData.description}
                                        onChange={(v) =>
                                          updateStage(trackKey, variant, stage, {
                                            description: v,
                                          })
                                        }
                                        multiline
                                      />
                                      <StageField
                                        label="Deliverable"
                                        value={stageData.deliverable}
                                        onChange={(v) =>
                                          updateStage(trackKey, variant, stage, {
                                            deliverable: v,
                                          })
                                        }
                                        multiline
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add track */}
      <div className="flex gap-2 items-center border border-dashed border-zinc-800 rounded-lg p-3 bg-zinc-950/40">
        <input
          type="text"
          value={newTrackLabel}
          onChange={(e) => setNewTrackLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTrack();
            }
          }}
          placeholder="Track label (e.g. Leadership / Executive)"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700"
        />
        <button
          type="button"
          onClick={addTrack}
          disabled={!newTrackLabel.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-[0.1em] font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add track
        </button>
      </div>
    </div>
  );
};

interface StageFieldProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: "text" | "number";
  className?: string;
}

function StageField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = "text",
  className = "",
}: StageFieldProps) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] block mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700"
        />
      )}
    </div>
  );
}
