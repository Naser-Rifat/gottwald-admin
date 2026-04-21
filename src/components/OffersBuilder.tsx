import { Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react";

export interface Offer {
  title: string;
  tier: "copper" | "silver" | "gold";
  description: string;
  deliverable: string;
}

interface OffersBuilderProps {
  offers: Offer[];
  onChange: (updater: (prev: Offer[]) => Offer[]) => void;
}

export const OffersBuilder = ({ offers, onChange }: OffersBuilderProps) => {
  const addOffer = () => {
    const newOffer: Offer = {
      title: "",
      tier: "copper",
      description: "",
      deliverable: "",
    };
    onChange((prev) => [...prev, newOffer]);
  };

  const updateOffer = (index: number, updates: Partial<Offer>) => {
    onChange((prev) =>
      prev.map((o, i) => (i === index ? { ...o, ...updates } : o)),
    );
  };

  const removeOffer = (index: number) => {
    onChange((prev) => prev.filter((_, i) => i !== index));
  };

  const moveOffer = (index: number, direction: "up" | "down") => {
    onChange((prev) => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">Offers</label>
        <span className="text-xs text-zinc-500">
          {offers.length} offer{offers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {offers.length === 0 && (
        <div className="border border-dashed border-zinc-700 rounded-lg p-8 text-center text-zinc-500 text-sm">
          No offers yet. Add one below.
        </div>
      )}

      {offers.map((offer, index) => (
        <div
          key={index}
          className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-500">
              #{index + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveOffer(index, "up")}
                disabled={index === 0}
                className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Move Up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveOffer(index, "down")}
                disabled={index === offers.length - 1}
                className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Move Down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeOffer(index)}
                className="p-1 rounded text-red-400/60 hover:text-red-400 transition-colors"
                title="Remove Offer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  value={offer.title}
                  onChange={(e) =>
                    updateOffer(index, { title: e.target.value })
                  }
                  placeholder="e.g. Strategic Assessment"
                  className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">
                  Tier
                </label>
                <select
                  value={offer.tier}
                  onChange={(e) =>
                    updateOffer(index, {
                      tier: e.target.value as "copper" | "silver" | "gold",
                    })
                  }
                  className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
                >
                  <option value="copper">Copper</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">
                Description
              </label>
              <textarea
                value={offer.description}
                onChange={(e) =>
                  updateOffer(index, { description: e.target.value })
                }
                placeholder="A focused strategy audit..."
                rows={2}
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-y"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">
                Deliverable
              </label>
              <textarea
                value={offer.deliverable}
                onChange={(e) =>
                  updateOffer(index, { deliverable: e.target.value })
                }
                placeholder="Strategic assessment report + executive summary"
                rows={2}
                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-y"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addOffer}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-zinc-700 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Offer
      </button>
    </div>
  );
};
