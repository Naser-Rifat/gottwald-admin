import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Pillar } from "../lib/types/pillar";
import { getPillars, deletePillar, reorderPillars } from "../lib/api/pillar";
import PillarCard from "../components/PillarCard";
import ViewToggle, { type ViewMode } from "../components/ViewToggle";
import { toast } from "sonner";

const VIEW_MODE_KEY = "gottwald_admin_pillars_view";

function pillarKey(p: Pillar): string {
  return p.id ?? p.slug;
}

// ─── SORTABLE ROW (list view) ────────────────────────────────────────────────

interface SortableRowProps {
  pillar: Pillar;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
  confirmDelete: string | null;
  setConfirmDelete: (id: string | null) => void;
  handleDelete: (id: string) => void;
  deletingId: string | null;
}

function SortableRow({
  pillar,
  onEdit,
  onDelete,
  deleting,
  confirmDelete,
  setConfirmDelete,
  handleDelete,
  deletingId,
}: SortableRowProps) {
  const key = pillarKey(pillar);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <PillarCard
        pillar={pillar}
        onEdit={onEdit}
        onDelete={onDelete}
        deleting={deleting}
        variant="list"
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
      {confirmDelete === key && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10">
          <p className="text-sm font-medium text-zinc-200">Delete this pillar?</p>
          <p className="text-xs text-zinc-400">This action cannot be undone.</p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => handleDelete(key)}
              disabled={deletingId === key}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {deletingId === key && (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Confirm Delete
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function PillarsList() {
  const navigate = useNavigate();
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || "grid",
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getPillars();
      setPillars(data);
    } catch (err) {
      toast.error("Failed to load pillars");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    setDeletingId(id);
    try {
      await deletePillar(id);
      toast.success("Pillar deleted");
      setPillars((prev) => prev.filter((p) => pillarKey(p) !== id));
    } catch (err) {
      toast.error("Failed to delete pillar");
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pillars.findIndex((p) => pillarKey(p) === active.id);
    const newIndex = pillars.findIndex((p) => pillarKey(p) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const previous = pillars;
    const next = arrayMove(pillars, oldIndex, newIndex);
    setPillars(next);

    try {
      await reorderPillars(next.map(pillarKey));
      toast.success("Order saved");
    } catch (err) {
      // Rollback on failure
      setPillars(previous);
      toast.error("Failed to save order");
      console.error(err);
    }
  };

  // ─── LOADING SKELETON ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="h-10 w-36 rounded-lg bg-zinc-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
            >
              <div className="aspect-video bg-zinc-800 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-zinc-800 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-zinc-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Pillars</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {pillars.length} pillar{pillars.length !== 1 ? "s" : ""}
            {viewMode === "list" && pillars.length > 1 && (
              <span className="ml-2 text-zinc-600">· drag to reorder</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle value={viewMode} onChange={handleViewChange} />
          <button
            onClick={() => navigate("/projects/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Pillar
          </button>
        </div>
      </div>

      {pillars.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300">No pillars yet</h3>
          <p className="text-sm text-zinc-500 mt-1 mb-6">
            Create your first pillar to get started.
          </p>
          <button
            onClick={() => navigate("/projects/new")}
            className="px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Create Pillar
          </button>
        </div>
      ) : viewMode === "list" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pillars.map(pillarKey)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {pillars.map((pillar) => {
                const key = pillarKey(pillar);
                return (
                  <SortableRow
                    key={key}
                    pillar={pillar}
                    onEdit={(id) => navigate(`/projects/${id}`)}
                    onDelete={handleDelete}
                    deleting={deletingId === key}
                    confirmDelete={confirmDelete}
                    setConfirmDelete={setConfirmDelete}
                    handleDelete={handleDelete}
                    deletingId={deletingId}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const key = pillarKey(pillar);
            return (
              <div key={key} className="relative">
                <PillarCard
                  pillar={pillar}
                  onEdit={(id) => navigate(`/projects/${id}`)}
                  onDelete={handleDelete}
                  deleting={deletingId === key}
                  variant="grid"
                />
                {confirmDelete === key && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                    <p className="text-sm font-medium text-zinc-200">
                      Delete this pillar?
                    </p>
                    <p className="text-xs text-zinc-400">
                      This action cannot be undone.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleDelete(key)}
                        disabled={deletingId === key}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === key && (
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
