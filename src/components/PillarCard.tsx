import { useNavigate } from "react-router-dom";

import type { HTMLAttributes } from "react";
import type { Pillar } from "../lib/types/pillar";
import { Pencil, Trash2 } from "lucide-react";

function DragDots({ className = "" }: { className?: string }) {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <circle cx="2" cy="2" r="1.1" />
      <circle cx="8" cy="2" r="1.1" />
      <circle cx="2" cy="7" r="1.1" />
      <circle cx="8" cy="7" r="1.1" />
      <circle cx="2" cy="12" r="1.1" />
      <circle cx="8" cy="12" r="1.1" />
    </svg>
  );
}

interface PillarCardProps {
  pillar: Pillar;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
  variant?: "grid" | "list";
  /** When provided (list mode only), renders a drag handle wired up to dnd-kit. */
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
}

export default function PillarCard({
  pillar,
  onEdit,
  onDelete,
  deleting,
  variant = "grid",
  dragHandleProps,
  isDragging = false,
}: PillarCardProps) {
  const navigate = useNavigate();
  const id = pillar.id ?? pillar.slug;

  if (variant === "list") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/projects/${id}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/projects/${id}`)}
        className={`group flex items-center gap-3 edge-highlight rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-3 transition-all hover:border-gold/40 hover:bg-zinc-900 hover:shadow-lg hover:shadow-gold/5 cursor-pointer ${
          isDragging ? "opacity-50 ring-2 ring-zinc-600" : ""
        }`}
      >
        {/* Drag handle */}
        {dragHandleProps && (
          <button
            type="button"
            aria-label="Drag to reorder"
            {...dragHandleProps}
            onClick={(e) => {
              dragHandleProps.onClick?.(e);
              e.stopPropagation();
            }}
            className="shrink-0 flex items-center justify-center w-6 h-6 rounded text-zinc-600 hover:text-gold cursor-grab active:cursor-grabbing touch-none transition-colors"
          >
            <DragDots />
          </button>
        )}

        {/* Thumbnail */}
        <div className="shrink-0 w-20 h-20 rounded-lg bg-zinc-800 overflow-hidden">
          {pillar.image ? (
            <img
              src={pillar.image}
              alt={pillar.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px]">
              No Image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm font-semibold text-zinc-100 truncate">
              {pillar.title}
            </h3>
            <span className="shrink-0 px-2 py-0.5 rounded-md border border-zinc-800/80 text-[10px] font-mono text-zinc-500 tracking-wide">
              {pillar.slug}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pillar.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full border border-zinc-800/60 text-[9px] font-medium text-zinc-500 uppercase tracking-[0.15em]"
              >
                {tag}
              </span>
            ))}
            {pillar.tags.length > 4 && (
              <span className="px-2 py-0.5 text-[10px] text-zinc-500">
                +{pillar.tags.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="shrink-0 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(id)}
            className="group flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-zinc-400 hover:text-gold transition-colors uppercase tracking-[0.18em]"
          >
            <Pencil className="w-3 h-3" />
            <span className="border-b border-transparent group-hover:border-gold/40 pb-px transition-colors">
              Edit
            </span>
          </button>
          <button
            onClick={() => onDelete(id)}
            disabled={deleting}
            className="group flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-[0.18em] disabled:opacity-50 disabled:pointer-events-none"
          >
            {deleting ? (
              <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            <span className="border-b border-transparent group-hover:border-red-400/40 pb-px transition-colors">
              Delete
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/projects/${id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/projects/${id}`)}
      className="group relative edge-highlight rounded-xl border border-zinc-800/70 bg-zinc-900/50 overflow-hidden transition-all hover:border-gold/40 hover:bg-zinc-900 hover:shadow-lg hover:shadow-gold/5 cursor-pointer"
    >
      {/* Cover Image */}
      <div className="aspect-video bg-zinc-800 overflow-hidden">
        {pillar.image ? (
          <img
            src={pillar.image}
            alt={pillar.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-100 leading-tight">
            {pillar.title}
          </h3>
          <span className="shrink-0 px-2 py-0.5 rounded-md border border-zinc-800/80 text-[10px] font-mono text-zinc-500 tracking-wide">
            {pillar.slug}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {pillar.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full border border-zinc-800/60 text-[9px] font-medium text-zinc-500 uppercase tracking-[0.15em]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-2 pt-2 border-t border-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(id)}
            className="group flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-zinc-400 hover:text-gold transition-colors uppercase tracking-[0.18em]"
          >
            <Pencil className="w-3 h-3" />
            <span className="border-b border-transparent group-hover:border-gold/40 pb-px transition-colors">
              Edit
            </span>
          </button>
          <button
            onClick={() => onDelete(id)}
            disabled={deleting}
            className="group flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-[0.18em] disabled:opacity-50 disabled:pointer-events-none"
          >
            {deleting ? (
              <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            <span className="border-b border-transparent group-hover:border-red-400/40 pb-px transition-colors">
              Delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
