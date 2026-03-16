import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../components/PillarForm";

export default function PillarNew() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Pillars
      </button>
      <h1 className="text-2xl font-bold text-zinc-100 mb-8">New Pillar</h1>
      <ProjectForm mode="create" />
    </div>
  );
}
