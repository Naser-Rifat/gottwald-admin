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
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
      </div>
    );
  }

  if (!id || !pillar) {
    return (
      <div className="text-center py-24">
        <p className="heading-eyebrow text-gold-dim">Not found</p>
        <h2 className="font-brand text-2xl text-zinc-100 uppercase mt-1">
          This pillar no longer exists.
        </h2>
        <p className="text-sm text-zinc-500 mt-3 mb-8 max-w-sm mx-auto leading-relaxed">
          It may have been deleted, or the link is incorrect.
        </p>
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-700 text-zinc-300 text-xs font-medium uppercase tracking-[0.2em] hover:border-gold/40 hover:text-gold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Pillars
        </button>
      </div>
    );
  }

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
        <p className="heading-eyebrow">Content · Edit</p>
        <h1 className="font-brand text-3xl text-zinc-50 uppercase">
          Edit Pillar
        </h1>
        <p className="text-[11px] text-zinc-500 mt-3 font-mono tracking-wide">
          gottwald.world/pillars/<span className="text-zinc-300">{pillar.slug}</span>
        </p>
      </div>
      <PillarForm mode="edit" initialData={pillar} />
    </div>
  );
}
