import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, startTransition } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getPillarById } from "../lib/api/pillar";
import PillarForm from "../components/PillarForm";
import type { Pillar } from "../lib/types/pillar";

export default function PillarEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pillar, setPillar] = useState<Pillar | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    startTransition(() => {
      setLoading(true);
      setPillar(undefined);
    });
    getPillarById(id)
      .then((data) => {
        if (!cancelled) setPillar(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isLoading = id ? loading : false;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!id || !pillar) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-zinc-300">
          Pillar not found
        </h2>
        <p className="text-sm text-zinc-500 mt-1 mb-6">
          The pillar does not exist.
        </p>
        <button
          onClick={() => navigate("/projects")}
          className="px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Back to Pillars
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
        Back to Pillars
      </button>
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">Edit Pillar</h1>
      <p className="text-sm text-zinc-500 mb-8 font-mono">{pillar.slug}</p>
      <PillarForm mode="edit" initialData={pillar} />
    </div>
  );
}
