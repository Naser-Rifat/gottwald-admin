import { useRef } from "react";
import type { ContentBlock } from "../lib/types/pillar";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Sun,
  Moon,
  ImagePlus,
  X,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface ContentBlockBuilderProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export default function ContentBlockBuilder({
  blocks,
  onChange,
}: ContentBlockBuilderProps) {
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type: "rich-text",
      theme: "dark",
      heading: "",
      body: "",
      image: "",
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const updated = blocks.map((b, i) =>
      i === index ? { ...b, ...updates } : b,
    );
    onChange(updated);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const updated = [...blocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const handleImageSelect = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateBlock(index, {
        image: reader.result as string,
        _imageFile: file,
      } as Partial<ContentBlock>);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (index: number) => {
    updateBlock(index, { image: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">
          Content Blocks
        </label>
        <span className="text-xs text-zinc-500">
          {blocks.length} block{blocks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {blocks.length === 0 && (
        <div className="border border-dashed border-zinc-700 rounded-lg p-8 text-center text-zinc-500 text-sm">
          No content blocks yet. Add one below.
        </div>
      )}

      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden"
        >
          {/* Block Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">
                #{index + 1}
              </span>
              <div className="flex items-center rounded-md overflow-hidden border border-zinc-700">
                <button
                  type="button"
                  onClick={() => updateBlock(index, { theme: "light" })}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                    block.theme === "light"
                      ? "bg-zinc-100 text-zinc-900"
                      : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Sun className="w-3 h-3" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(index, { theme: "dark" })}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                    block.theme === "dark"
                      ? "bg-zinc-700 text-zinc-100"
                      : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
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
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">
                Heading
              </label>
              <input
                type="text"
                value={block.heading || ""}
                onChange={(e) =>
                  updateBlock(index, { heading: e.target.value })
                }
                placeholder="Block heading..."
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">
                Body
              </label>
              <RichTextEditor
                value={block.body || ""}
                onChange={(html) => updateBlock(index, { body: html })}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
                Image
              </label>
              <input
                ref={(el) => {
                  if (el) fileInputRefs.current.set(block.id, el);
                }}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(index, file);
                }}
                className="hidden"
              />

              {block.image ? (
                <div className="flex items-start gap-3">
                  <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <img
                      src={block.image}
                      alt={block.heading || `Block ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => clearImage(index)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current.get(block.id)?.click()}
                    className="px-3 py-2 rounded-lg border border-dashed border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRefs.current.get(block.id)?.click()}
                  className="flex items-center gap-2 px-4 py-3 w-full rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                  Upload Image
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-zinc-700 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Block
      </button>
    </div>
  );
}
