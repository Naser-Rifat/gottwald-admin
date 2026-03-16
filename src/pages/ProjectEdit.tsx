import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getProject } from "../lib/api/projects";
import ProjectForm from "../components/ProjectForm";
import type { Project } from "../lib/types/project";

export default function ProjectEdit() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getProject(slug).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-zinc-300">Project not found</h2>
        <p className="text-sm text-zinc-500 mt-1 mb-6">
          The project with slug &ldquo;{slug}&rdquo; does not exist.
        </p>
        <button
          onClick={() => navigate("/projects")}
          className="px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">Edit Project</h1>
      <p className="text-sm text-zinc-500 mb-8 font-mono">{project.slug}</p>
      <ProjectForm mode="edit" initialData={project} />
    </div>
  );
}
