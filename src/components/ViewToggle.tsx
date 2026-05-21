import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

function ToggleButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={label}
      onClick={onClick}
      className={`relative flex items-center justify-center w-9 h-9 transition-colors ${
        active
          ? "text-gold"
          : "text-zinc-500 hover:text-zinc-200"
      }`}
    >
      {children}
      <span
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-px transition-all ${
          active ? "w-5 bg-gold" : "w-0 bg-transparent"
        }`}
      />
    </button>
  );
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex items-center gap-1"
    >
      <ToggleButton
        active={value === "grid"}
        label="Grid view"
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="w-4 h-4" />
      </ToggleButton>
      <ToggleButton
        active={value === "list"}
        label="List view"
        onClick={() => onChange("list")}
      >
        <List className="w-4 h-4" />
      </ToggleButton>
    </div>
  );
}
