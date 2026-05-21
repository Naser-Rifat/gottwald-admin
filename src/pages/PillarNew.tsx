import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../components/PillarForm";

export default function PillarNew() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate("/projects")}
        className="group flex items-center gap-2 text-[11px] text-zinc-500 hover:text-gold transition-colors mb-8 uppercase tracking-[0.2em]"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Pillars
      </button>
      <div className="heading-underline mb-10">
        <p className="heading-eyebrow">Content · New</p>
        <h1 className="font-brand text-3xl text-zinc-50 uppercase">New Pillar</h1>
      </div>
      <ProjectForm mode="create" />
    </div>
  );
}
