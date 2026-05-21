import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ContentBlock } from "../lib/types/pillar";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Sun,
  Moon,
  ImagePlus,
  AlertTriangle,
} from "lucide-react";
import { validateImage, DEFAULT_IMAGE_CONFIG } from "../lib/utils/image-validation";
import RichTextEditor from "./ui/RichTextEditor";

interface ContentBlockBuilderProps {
  blocks: ContentBlock[];
  onChange: (updater: (prev: ContentBlock[]) => ContentBlock[]) => void;
}

export default function ContentBlockBuilder({
  blocks,
  onChange,
}: ContentBlockBuilderProps) {
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const [blockImageErrors, setBlockImageErrors] = useState<Record<string, string>>({});
  const [validatingBlocks, setValidatingBlocks] = useState<Record<string, boolean>>({});

  const setBlockError = (blockId: string, error: string) => {
    setBlockImageErrors((prev) => ({ ...prev, [blockId]: error }));
  };

  const clearBlockError = (blockId: string) => {
    setBlockImageErrors((prev) => {
      const next = { ...prev };
      delete next[blockId];
      return next;
    });
  };

  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type: "rich-text",
      theme: "dark",
      heading: "",
      body: "",
      image: "",
    };
    onChange((prev) => [...prev, newBlock]);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    onChange((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...updates } : b)),
    );
  };

  const removeBlock = (index: number) => {
    onChange((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    onChange((prev) => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const handleImageSelect = async (index: number, file: File, blockId: string) => {
    clearBlockError(blockId);
    setValidatingBlocks((prev) => ({ ...prev, [blockId]: true }));

    const result = await validateImage(file);

    setValidatingBlocks((prev) => ({ ...prev, [blockId]: false }));

    if (!result.valid) {
      setBlockError(blockId, result.error || "Invalid image.");
      toast.error(result.error || "Invalid image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateBlock(index, {
        image: reader.result as string,
        _imageFile: file,
      } as Partial<ContentBlock>);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (index: number, blockId: string) => {
    clearBlockError(blockId);
    updateBlock(index, { image: "", _imageFile: undefined });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em]">
          Content Blocks
        </label>
        <span className="text-xs text-zinc-500">
          {blocks.length} block{blocks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {blocks.length === 0 && (
        <div className="border border-dashed border-zinc-800/60 rounded-xl p-10 text-center">
          <p className="text-2xl text-zinc-800 font-brand mb-2">—</p>
          <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-[0.2em]">No content blocks</p>
          <p className="text-[11px] text-zinc-700 mt-1">Add scrollable panels that appear after the hero section.</p>
        </div>
      )}

      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden"
        >
          {/* Block Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-zinc-600">#{index + 1}</span>
              <span className="text-xs text-zinc-400 truncate max-w-40">
                {block.heading || <span className="italic text-zinc-600">Untitled block</span>}
              </span>
              <div className="flex items-center rounded-md overflow-hidden border border-zinc-800">
                <button
                  type="button"
                  onClick={() => updateBlock(index, { theme: "light" })}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                    block.theme === "light"
                      ? "bg-zinc-200 text-zinc-900"
                      : "bg-zinc-900 text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  <Sun className="w-3 h-3" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(index, { theme: "dark" })}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                    block.theme === "dark"
                      ? "bg-zinc-800 text-gold"
                      : "bg-zinc-900 text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  <Moon className="w-3 h-3" /> Dark
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(index, "up")}
                disabled={index === 0}
                className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, "down")}
                disabled={index === blocks.length - 1}
                className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="p-1 rounded text-red-400/60 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Block Fields */}
          <div className="p-4 space-y-3">
            <div>
              <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em] mb-1 block">
                Heading
              </label>
              <input
                type="text"
                value={block.heading || ""}
                onChange={(e) =>
                  updateBlock(index, { heading: e.target.value })
                }
                placeholder="Block heading..."
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em] mb-1 block">
                Body
              </label>
              <RichTextEditor
                value={block.body || ""}
                onChange={(html) => updateBlock(index, { body: html })}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em] mb-1.5 block">
                Image
              </label>
              <input
                ref={(el) => {
                  if (el) fileInputRefs.current.set(block.id, el);
                  else fileInputRefs.current.delete(block.id);
                }}
                type="file"
                name={`content_block_${block.id}_image`}
                accept={DEFAULT_IMAGE_CONFIG.allowedTypes.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageSelect(index, file, block.id);
                    e.target.value = "";
                  }
                }}
                className="hidden"
              />

              {block.image ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-zinc-700/40 group">
                  <img
                    src={block.image}
                    alt={block.heading || `Block ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current.get(block.id)?.click()}
                      disabled={!!validatingBlocks[block.id]}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-700 text-xs font-medium text-zinc-200 hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-50"
                    >
                      {validatingBlocks[block.id] ? "Validating…" : "Change"}
                    </button>
                    <button
                      type="button"
                      onClick={() => clearImage(index, block.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-700 text-xs font-medium text-red-400 hover:border-red-500/50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRefs.current.get(block.id)?.click()}
                  disabled={!!validatingBlocks[block.id]}
                  className="w-full aspect-video rounded-xl border border-dashed border-zinc-700/80 bg-zinc-900/30 flex flex-col items-center justify-center gap-2 hover:border-gold/40 hover:bg-zinc-900/60 transition-all group disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ImagePlus className="w-6 h-6 text-zinc-700 group-hover:text-gold/50 transition-colors" />
                  <p className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {validatingBlocks[block.id] ? "Validating…" : "Upload Image"}
                  </p>
                </button>
              )}
              <p className="text-[10px] text-zinc-600 mt-1">
                JPEG, PNG, WebP, AVIF, GIF · Max {DEFAULT_IMAGE_CONFIG.maxSizeLabel}
              </p>
              {blockImageErrors[block.id] && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{blockImageErrors[block.id]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700/80 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 hover:text-gold hover:border-gold/40 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Block
      </button>
    </div>
  );
}
