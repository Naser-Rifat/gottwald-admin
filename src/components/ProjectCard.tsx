import type { Project } from "../lib/types/project";
import { Pencil, Trash2 } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onEdit: (slug: string) => void;
  onDelete: (slug: string) => void;
  deleting: boolean;
}

export default function ProjectCard({ project, onEdit, onDelete, deleting }: ProjectCardProps) {
  return (
    <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all hover:border-zinc-700 hover:bg-zinc-900">
      {/* Cover Image */}
      <div className="aspect-video bg-zinc-800 overflow-hidden">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
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
            {project.title}
          </h3>
          <span className="shrink-0 px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-400">
            {project.slug}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-zinc-800/80 text-[10px] font-medium text-zinc-400 uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={() => onEdit(project.slug)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => onDelete(project.slug)}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 bg-zinc-800 hover:bg-red-950/50 hover:text-red-300 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {deleting ? (
              <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
