import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import type { Pillar, ContentBlock } from "../lib/types/pillar";
import { createPillar, updatePillar } from "../lib/api/pillar";
import ContentBlockBuilder from "./ContentBlockBuilder";
import PillarPreview from "./PillarPreview";

// ─── ZOD SCHEMA ──────────────────────────────────────────────────────────────

const pillarSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters and hyphens only"),
  description: z.string().min(1).max(120, "Max 120 characters"),
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
  const [tagInput, setTagInput] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    initialData?.contentBlocks || [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  // ─── SLUG AUTO-GENERATE ──────────────────────────────────────────────────────

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue("title", title);
    if (mode === "create") {
      const slug = title
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
    if (trimmed && !tags.includes(trimmed)) {
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
    setValue("services", [...services, ""]);
  };

  const updateService = (index: number, value: string) => {
    const updated = [...services];
    updated[index] = value;
    setValue("services", updated);
  };

  const removeService = (index: number) => {
    setValue(
      "services",
      services.filter((_, i) => i !== index),
    );
  };

  // ─── IMAGE ───────────────────────────────────────────────────────────────────

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // ─── SUBMIT ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: PillarFormValues) => {
    setSubmitting(true);
    try {
      const imageUrl = imageFile
        ? ""
        : (data.image || initialData?.image || "");

      const pillarData: Pillar = {
        ...data,
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
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Title
          </label>
          <input
            {...register("title")}
            onChange={handleTitleChange}
            placeholder="Pillar title"
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          {errors.title && (
            <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Slug
          </label>
          <input
            {...register("slug")}
            placeholder="pillar-slug"
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
          />
          {errors.slug && (
            <p className="text-xs text-red-400 mt-1">{errors.slug.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-zinc-300">
            Description
          </label>
          <span
            className={`text-xs ${(watch("description")?.length || 0) > 120 ? "text-red-400" : "text-zinc-500"}`}
          >
            {watch("description")?.length || 0}/120
          </span>
        </div>
        <input
          {...register("description")}
          placeholder="Short pillar description"
          className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
        />
        {errors.description && (
          <p className="text-xs text-red-400 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Details */}
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
          Details
        </label>
        <textarea
          {...register("details")}
          placeholder="Full pillar details..."
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-y"
        />
        {errors.details && (
          <p className="text-xs text-red-400 mt-1">{errors.details.message}</p>
        )}
      </div>

      {/* Cover Image */}
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
          Cover Image
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          name="cover_image"
          onChange={handleImageSelect}
          className="hidden"
        />
        <div className="flex items-start gap-4">
          {imagePreview ? (
            <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0">
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
                  setValue("image", "");
                }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
          >
            {imagePreview ? "Change Image" : "Upload Image"}
          </button>
        </div>
      </div>

      {/* Launch URL */}
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
          Launch URL
        </label>
        <input
          {...register("launchUrl")}
          placeholder="https://example.com"
          className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
        />
        {errors.launchUrl && (
          <p className="text-xs text-red-400 mt-1">
            {errors.launchUrl.message}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              onClick={() => removeTag(tag)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 cursor-pointer hover:bg-red-950/40 hover:text-red-300 transition-colors"
            >
              {tag}
              <X className="w-3 h-3" />
            </span>
          ))}
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
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Add
          </button>
        </div>
        {errors.tags && (
          <p className="text-xs text-red-400 mt-1">{errors.tags.message}</p>
        )}
      </div>

      {/* Services */}
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
          Services
        </label>
        <div className="space-y-2">
          {services.map((service, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={service}
                onChange={(e) => updateService(index, e.target.value)}
                placeholder={`Service ${index + 1}`}
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => removeService(index)}
                disabled={services.length <= 1}
                className="p-2 rounded-lg text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addService}
          className="flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Service
        </button>
        {errors.services && (
          <p className="text-xs text-red-400 mt-1">{errors.services.message}</p>
        )}
      </div>

      {/* Theme Colors */}
      <div>
        <label className="text-sm font-medium text-zinc-300 mb-3 block">
          Theme Colors
        </label>
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
      </div>

      {/* Content Blocks */}
      <ContentBlockBuilder
        blocks={contentBlocks}
        onChange={handleBlocksChange}
      />

      {/* Live Preview */}
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

      {/* Submit */}
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
