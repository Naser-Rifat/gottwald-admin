import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Plus, Trash2, Loader2, AlertTriangle, Info } from "lucide-react";
import type { Pillar, ContentBlock } from "../lib/types/pillar";
import { createPillar, updatePillar } from "../lib/api/pillar";
import { ApiError } from "../lib/api/error";
import { validateImage, DEFAULT_IMAGE_CONFIG } from "../lib/utils/image-validation";
import ContentBlockBuilder from "./ContentBlockBuilder";
import PillarPreview from "./PillarPreview";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TITLE_MAX = 80;
const DESCRIPTION_MAX = 120;
const DETAILS_RECOMMENDED_MIN = 80;
const DETAILS_RECOMMENDED_MAX = 600;
const SERVICE_MAX_LENGTH = 60;
const MAX_SERVICES = 12;
const MAX_TAGS = 15;

// ─── AUTO-RESIZE UTILITY ─────────────────────────────────────────────────────

function autoResizeTextarea(el: HTMLTextAreaElement | null, minHeight = 42) {
  if (!el) return;
  el.style.height = "0px";
  el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
}

// ─── CHARACTER COUNTER COMPONENT ──────────────────────────────────────────────

function CharCounter({
  current,
  max,
  recommended,
  showBar = false,
  label = "characters",
}: {
  current: number;
  max?: number;
  recommended?: { min: number; max: number };
  showBar?: boolean;
  label?: string;
}) {
  const isOver = max != null && current > max;
  const isNearLimit = max != null && current > max * 0.85;
  const pct = max != null ? Math.min((current / max) * 100, 100) : 0;

  let barColor = "bg-emerald-500/60";
  if (isOver) barColor = "bg-red-500/80";
  else if (isNearLimit) barColor = "bg-amber-500/70";

  let textColor = "text-zinc-500";
  if (isOver) textColor = "text-red-400";
  else if (isNearLimit) textColor = "text-amber-400";

  const inRange =
    recommended != null &&
    current >= recommended.min &&
    current <= recommended.max;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={`text-[11px] tabular-nums ${textColor}`}>
          {current}
          {max != null && `/${max}`} {label}
        </span>
        {recommended != null && (
          <span
            className={`text-[10px] ${inRange ? "text-emerald-500" : "text-zinc-600"}`}
          >
            {inRange
              ? "✓ Good length"
              : current < recommended.min
                ? `Recommended: ${recommended.min}+ chars`
                : `Recommended: under ${recommended.max} chars`}
          </span>
        )}
      </div>
      {showBar && max != null && (
        <div className="h-0.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── HELPER TEXT COMPONENT ────────────────────────────────────────────────────

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-zinc-600 mt-1 leading-relaxed">
      <Info className="w-3 h-3 shrink-0 mt-0.5 opacity-60" />
      <span>{children}</span>
    </p>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="pb-2 mb-4 border-b border-zinc-800/60">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>
      {description && (
        <p className="text-[11px] text-zinc-600 mt-0.5">{description}</p>
      )}
    </div>
  );
}

// ─── ZOD SCHEMA ──────────────────────────────────────────────────────────────

const pillarSchema = z.object({
  title: z
    .string()
    .min(2, "Title is required")
    .max(TITLE_MAX, `Title must be under ${TITLE_MAX} characters`),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters and hyphens only"),
  description: z.string().min(1, "Description is required").max(DESCRIPTION_MAX, `Max ${DESCRIPTION_MAX} characters`),
  details: z.string().min(1, "Details are required"),
  launchUrl: z.string().url("Must be a valid URL"),
  tags: z.array(z.string()).min(1, "Add at least one tag"),
  services: z.array(z.string()).min(1, "Add at least one service"),
  theme: z.object({
    background: z.string(),
    text: z.string(),
    accent: z.string(),
  }),
  image: z.string().optional(),
});

type PillarFormValues = z.infer<typeof pillarSchema>;

// ─── PROPS ───────────────────────────────────────────────────────────────────

interface PillarFormProps {
  mode: "create" | "edit";
  initialData?: Pillar;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function PillarForm({ mode, initialData }: PillarFormProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.image || "",
  );
  const [imageError, setImageError] = useState<string>("");
  const [imageValidating, setImageValidating] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    initialData?.contentBlocks || [],
  );
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for auto-resizing textareas — assigned via callback refs
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const detailsRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<PillarFormValues>({
    resolver: zodResolver(pillarSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      details: initialData?.details || "",
      launchUrl: initialData?.launchUrl || "",
      tags: initialData?.tags || [],
      services: initialData?.services || [""],
      theme: initialData?.theme || {
        background: "#121212",
        text: "#F5F5F5",
        accent: "#A8B4B8",
      },
      image: initialData?.image || "",
    },
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleBlocksChange = useCallback(
    (fn: (prev: ContentBlock[]) => ContentBlock[]) => setContentBlocks(fn),
    []
  );

  const tags = watch("tags");
  const services = watch("services");
  const theme = watch("theme");
  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedDescription = watch("description");
  const watchedDetails = watch("details");
  const watchedLaunchUrl = watch("launchUrl");

  // Register fields once and capture their refs + handlers
  const titleRegistration = register("title");
  const descriptionRegistration = register("description");
  const detailsRegistration = register("details");

  // Auto-resize textareas when their values change
  useEffect(() => { autoResizeTextarea(titleRef.current, 42); }, [watchedTitle]);
  useEffect(() => { autoResizeTextarea(descriptionRef.current, 60); }, [watchedDescription]);

  // ─── SLUG AUTO-GENERATE ──────────────────────────────────────────────────────

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Prevent newlines in title
    const sanitized = e.target.value.replace(/[\r\n]/g, " ");
    if (sanitized !== e.target.value) {
      e.target.value = sanitized;
    }

    // Forward to react-hook-form's onChange so validation/dirty state updates
    titleRegistration.onChange(e);

    if (mode === "create" && !isSlugManuallyEdited) {
      const slug = sanitized
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  };

  // ─── TAGS ────────────────────────────────────────────────────────────────────

  const addTag = () => {
    const trimmed = tagInput.trim().toUpperCase();
    if (!trimmed) return;
    if (tags.length >= MAX_TAGS) {
      toast.error(`Maximum ${MAX_TAGS} tags allowed`);
      return;
    }
    if (!tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag),
    );
  };

  // ─── SERVICES ────────────────────────────────────────────────────────────────

  const addService = () => {
    if (services.length >= MAX_SERVICES) {
      toast.error(`Maximum ${MAX_SERVICES} services allowed`);
      return;
    }
    setValue("services", [...services, ""]);
  };

  const updateService = (index: number, value: string) => {
    // Enforce character limit on service entries
    const clamped = value.slice(0, SERVICE_MAX_LENGTH);
    const updated = [...services];
    updated[index] = clamped;
    setValue("services", updated);
  };

  const removeService = (index: number) => {
    setValue(
      "services",
      services.filter((_, i) => i !== index),
    );
  };

  // ─── IMAGE ───────────────────────────────────────────────────────────────────

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImageError("");
    setImageValidating(true);

    const result = await validateImage(file);

    setImageValidating(false);

    if (!result.valid) {
      setImageError(result.error || "Invalid image.");
      toast.error(result.error || "Invalid image.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ─── SUBMIT ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: PillarFormValues) => {
    // Filter out empty services before submission
    const cleanedServices = data.services.filter((s) => s.trim() !== "");
    if (cleanedServices.length === 0) {
      setError("services", { type: "manual", message: "Add at least one non-empty service" });
      return;
    }

    setSubmitting(true);
    try {
      const imageUrl = imageFile
        ? ""
        : (data.image || initialData?.image || "");

      const pillarData: Pillar = {
        ...data,
        services: cleanedServices,
        image: imageUrl,
        contentBlocks,
      };

      if (mode === "create") {
        await createPillar(pillarData, imageFile);
        toast.success("Pillar created successfully!");
      } else {
        const id = initialData?.id ?? data.slug;
        if (!id) throw new Error("Pillar id required for update");
        await updatePillar(id, pillarData, imageFile);
        toast.success("Pillar updated successfully!");
      }

      navigate("/projects");
    } catch (err) {
      if (err instanceof ApiError && err.data) {
        Object.entries(err.data).forEach(([key, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages;
          if (["title", "slug", "description", "details", "launchUrl", "tags", "services", "theme", "image"].includes(key)) {
            setError(key as keyof PillarFormValues, { type: "server", message: String(message) });
          } else if (key !== "detail" && key !== "message") {
            toast.error(`${key}: ${message}`);
          }
        });
        toast.error(err.message || "Please fix the validation errors below.");
      } else {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  const titleLen = watchedTitle?.length || 0;
  const descLen = watchedDescription?.length || 0;
  const detailsLen = watchedDetails?.length || 0;
  const detailsWords = watchedDetails
    ? watchedDetails.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 pb-12">
      {/* ═══════════════ SECTION: Identity ═══════════════ */}
      <section>
        <SectionHeader
          title="Identity"
          description="Core identifiers for this pillar"
        />

        {/* Title */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Title
            </label>
            <CharCounter current={titleLen} max={TITLE_MAX} />
          </div>
          <textarea
            name={titleRegistration.name}
            onBlur={titleRegistration.onBlur}
            ref={(el) => {
              titleRegistration.ref(el);
              titleRef.current = el;
            }}
            onChange={handleTitleChange}
            placeholder="e.g. Brand Strategy & Identity Design"
            rows={1}
            maxLength={TITLE_MAX}
            className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all resize-none overflow-hidden"
            style={{ minHeight: "42px" }}
          />
          {errors.title && (
            <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
          )}
          <FieldHint>
            A concise, compelling title. This appears as the main heading on the public pillar page.
          </FieldHint>
        </div>

        {/* Slug */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Slug
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600 select-none">
              /pillars/
            </span>
            <input
              {...register("slug")}
              onChange={(e) => {
                setValue("slug", e.target.value, { shouldValidate: true, shouldDirty: true });
                setIsSlugManuallyEdited(true);
              }}
              placeholder="pillar-slug"
              className="w-full pl-18 pr-3 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all font-mono"
            />
          </div>
          {errors.slug && (
            <p className="text-xs text-red-400 mt-1">{errors.slug.message}</p>
          )}
          <FieldHint>
            URL-friendly identifier. Auto-generated from the title — edit manually to customize.
          </FieldHint>
        </div>
      </section>

      {/* ═══════════════ SECTION: Content ═══════════════ */}
      <section>
        <SectionHeader
          title="Content"
          description="Text content that appears on the pillar's hero section"
        />

        {/* Description */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Description
            </label>
          </div>
          <textarea
            name={descriptionRegistration.name}
            onBlur={descriptionRegistration.onBlur}
            onChange={descriptionRegistration.onChange}
            ref={(el) => {
              descriptionRegistration.ref(el);
              descriptionRef.current = el;
            }}
            placeholder="A short tagline or summary — one or two sentences max"
            rows={2}
            maxLength={DESCRIPTION_MAX}
            className={`w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/80 border text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:bg-zinc-800 transition-all resize-none overflow-hidden ${
              descLen > DESCRIPTION_MAX
                ? "border-red-500/60 focus:border-red-500"
                : "border-zinc-700/80 focus:border-zinc-500"
            }`}
            style={{ minHeight: "60px" }}
          />
          <div className="mt-1.5">
            <CharCounter current={descLen} max={DESCRIPTION_MAX} showBar />
          </div>
          {errors.description && (
            <p className="text-xs text-red-400 mt-1">
              {errors.description.message}
            </p>
          )}
          <FieldHint>
            A brief elevator-pitch for this pillar. Shown directly below the title on the public site. Keep it punchy and under {DESCRIPTION_MAX} characters.
          </FieldHint>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Details
            </label>
          </div>
          <textarea
            name={detailsRegistration.name}
            onBlur={detailsRegistration.onBlur}
            onChange={detailsRegistration.onChange}
            ref={(el) => {
              detailsRegistration.ref(el);
              detailsRef.current = el;
            }}
            placeholder="Describe the scope, methodology, and outcomes of this pillar in detail. Expand on the description to give visitors a thorough understanding of what this pillar encompasses..."
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all resize-y leading-relaxed"
            style={{ minHeight: "120px", maxHeight: "400px" }}
          />
          <div className="flex items-center justify-between mt-1.5">
            <CharCounter
              current={detailsLen}
              recommended={{ min: DETAILS_RECOMMENDED_MIN, max: DETAILS_RECOMMENDED_MAX }}
            />
            <span className="text-[11px] text-zinc-600 tabular-nums">
              {detailsWords} word{detailsWords !== 1 ? "s" : ""}
            </span>
          </div>
          {errors.details && (
            <p className="text-xs text-red-400 mt-1">{errors.details.message}</p>
          )}
          <FieldHint>
            The extended body copy for this pillar. Appears below the description in a smaller font. Recommended {DETAILS_RECOMMENDED_MIN}–{DETAILS_RECOMMENDED_MAX} characters for optimal readability.
          </FieldHint>
        </div>
      </section>

      {/* ═══════════════ SECTION: Media ═══════════════ */}
      <section>
        <SectionHeader
          title="Media"
          description="Hero image displayed alongside the pillar content"
        />

        {/* Cover Image */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={DEFAULT_IMAGE_CONFIG.allowedTypes.join(",")}
            name="cover_image"
            onChange={handleImageSelect}
            className="hidden"
          />
          <div className="flex items-start gap-4">
            {imagePreview ? (
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0 ring-1 ring-zinc-700/40">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                    setImageError("");
                    setValue("image", "");
                  }}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageValidating}
                className="px-4 py-2.5 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {imageValidating
                  ? "Validating..."
                  : imagePreview
                    ? "Change Image"
                    : "Upload Image"}
              </button>
              <p className="text-[10px] text-zinc-600">
                JPEG, PNG, WebP, AVIF, GIF · Max {DEFAULT_IMAGE_CONFIG.maxSizeLabel}
              </p>
            </div>
          </div>
          {imageError && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ SECTION: Links ═══════════════ */}
      <section>
        <SectionHeader
          title="Links"
          description="External URL for the pillar project"
        />

        {/* Launch URL */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Launch URL
          </label>
          <input
            {...register("launchUrl")}
            placeholder="https://example.com"
            className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all"
          />
          {errors.launchUrl && (
            <p className="text-xs text-red-400 mt-1">
              {errors.launchUrl.message}
            </p>
          )}
          <FieldHint>
            The "Visit Website" button will link to this URL. Must be a fully qualified URL (e.g. https://...).
          </FieldHint>
        </div>
      </section>

      {/* ═══════════════ SECTION: Classification ═══════════════ */}
      <section>
        <SectionHeader
          title="Classification"
          description="Tags and services displayed on the pillar page"
        />

        {/* Tags */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Tags
            </label>
            <span className="text-[11px] text-zinc-600 tabular-nums">
              {tags.length}/{MAX_TAGS}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2 min-h-7">
            {tags.map((tag) => (
              <span
                key={tag}
                onClick={() => removeTag(tag)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 cursor-pointer hover:bg-red-950/40 hover:text-red-300 transition-colors group"
              >
                {tag}
                <X className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </span>
            ))}
            {tags.length === 0 && (
              <span className="text-[11px] text-zinc-600 italic py-1">
                No tags added yet
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type a tag and press Enter"
              maxLength={30}
              disabled={tags.length >= MAX_TAGS}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={tags.length >= MAX_TAGS || !tagInput.trim()}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Add
            </button>
          </div>
          {errors.tags && (
            <p className="text-xs text-red-400 mt-1">{errors.tags.message}</p>
          )}
          <FieldHint>
            Tags appear at the top of the pillar page as categories. Displayed uppercase. Press Enter or click Add.
          </FieldHint>
        </div>

        {/* Services */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Services
            </label>
            <span className="text-[11px] text-zinc-600 tabular-nums">
              {services.filter((s) => s.trim()).length}/{MAX_SERVICES}
            </span>
          </div>
          <div className="space-y-2">
            {services.map((service, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="text-[10px] font-mono text-zinc-600 w-5 text-right shrink-0 select-none">
                  {index + 1}.
                </span>
                <div className="flex-1 relative">
                  <input
                    value={service}
                    onChange={(e) => updateService(index, e.target.value)}
                    placeholder={`e.g. ${["Brand Identity", "UX Research", "Web Development", "Content Strategy", "Visual Design", "Motion Design"][index % 6]}`}
                    maxLength={SERVICE_MAX_LENGTH}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all pr-12"
                  />
                  {service.length > 0 && (
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums select-none ${
                        service.length >= SERVICE_MAX_LENGTH
                          ? "text-amber-400"
                          : "text-zinc-600"
                      }`}
                    >
                      {service.length}/{SERVICE_MAX_LENGTH}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  disabled={services.length <= 1}
                  className="p-2 rounded-lg text-zinc-600 hover:text-red-400 disabled:opacity-20 disabled:pointer-events-none transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addService}
            disabled={services.length >= MAX_SERVICES}
            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Plus className="w-3 h-3" />
            Add Service
          </button>
          {errors.services && (
            <p className="text-xs text-red-400 mt-1">{errors.services.message}</p>
          )}
          <FieldHint>
            Individual services listed under the "Services" heading on the pillar page. Keep each entry short and specific.
          </FieldHint>
        </div>
      </section>

      {/* ═══════════════ SECTION: Theme ═══════════════ */}
      <section>
        <SectionHeader
          title="Theme"
          description="Color scheme for the pillar's public page"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["background", "text", "accent"] as const).map((key) => (
            <div key={key} className="flex items-center gap-3">
              <input
                type="color"
                value={theme[key]}
                onChange={(e) => setValue(`theme.${key}`, e.target.value)}
                className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer bg-transparent"
              />
              <div>
                <p className="text-xs font-medium text-zinc-300 capitalize">
                  {key}
                </p>
                <p className="text-[10px] font-mono text-zinc-500">
                  {theme[key]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Theme Preview */}
        <div
          className="mt-4 rounded-lg p-4 border border-zinc-700 transition-colors"
          style={{ backgroundColor: theme.background, color: theme.text }}
        >
          <p className="text-sm font-semibold">Theme Preview</p>
          <p className="text-xs mt-1 opacity-70">
            This is how the pillar page will look.
          </p>
          <span
            className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase"
            style={{ backgroundColor: theme.accent, color: theme.background }}
          >
            Accent Color
          </span>
        </div>
      </section>

      {/* ═══════════════ Content Blocks ═══════════════ */}
      <section>
        <SectionHeader
          title="Content Blocks"
          description="Additional scrollable panels displayed after the hero section"
        />
        <ContentBlockBuilder
          blocks={contentBlocks}
          onChange={handleBlocksChange}
        />
      </section>

      {/* ═══════════════ Live Preview ═══════════════ */}
      <PillarPreview
        data={{
          title: watchedTitle,
          slug: watchedSlug,
          description: watchedDescription,
          details: watchedDetails,
          tags,
          services,
          image: imagePreview,
          launchUrl: watchedLaunchUrl,
          theme,
          contentBlocks,
        }}
        visible={showPreview}
        onToggle={() => setShowPreview((v) => !v)}
      />

      {/* ═══════════════ Submit ═══════════════ */}
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "create" ? "Create Pillar" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="px-6 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
