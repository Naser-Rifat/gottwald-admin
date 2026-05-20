import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-900 border border-zinc-800"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "grid"}
        aria-label="Grid view"
        onClick={() => onChange("grid")}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
          value === "grid"
            ? "bg-zinc-700 text-zinc-100"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "list"}
        aria-label="List view"
        onClick={() => onChange("list")}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
          value === "list"
            ? "bg-zinc-700 text-zinc-100"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
