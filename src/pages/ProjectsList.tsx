import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import type { Project } from "../lib/types/project";
import { getProjects, deleteProject } from "../lib/api/projects";
import ProjectCard from "../components/ProjectCard";
import { toast } from "sonner";

export default function ProjectsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      toast.error("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (confirmDelete !== slug) {
      setConfirmDelete(slug);
      return;
    }

    setDeletingSlug(slug);
    try {
      await deleteProject(slug);
      toast.success("Project deleted");
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err) {
      toast.error("Failed to delete project");
      console.error(err);
    } finally {
      setDeletingSlug(null);
      setConfirmDelete(null);
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
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
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
          <h1 className="text-2xl font-bold text-zinc-100">Projects</h1>
          <p className="text-sm text-zinc-500 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => navigate("/projects/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300">No projects yet</h3>
          <p className="text-sm text-zinc-500 mt-1 mb-6">Create your first project to get started.</p>
          <button
            onClick={() => navigate("/projects/new")}
            className="px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.slug} className="relative">
              <ProjectCard
                project={project}
                onEdit={(slug) => navigate(`/projects/${slug}`)}
                onDelete={handleDelete}
                deleting={deletingSlug === project.slug}
              />
              {/* Confirm Delete Overlay */}
              {confirmDelete === project.slug && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                  <p className="text-sm font-medium text-zinc-200">Delete this project?</p>
                  <p className="text-xs text-zinc-400">This action cannot be undone.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleDelete(project.slug)}
                      disabled={deletingSlug === project.slug}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 disabled:opacity-50 transition-colors"
                    >
                      {deletingSlug === project.slug && (
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
          ))}
        </div>
      )}
    </div>
  );
}
