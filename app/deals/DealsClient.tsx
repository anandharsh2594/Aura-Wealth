"use client";

import { useMemo, useState } from "react";
import type { CreditCard } from "../explore/data/types";
import CardsLandingClient from "../components/CardsLandingClient";

type DealSection = {
  key: string;
  title: string;
  description: string;
  cards: CreditCard[];
};

export default function DealsClient({ sections }: { sections: DealSection[] }) {
  const [active, setActive] = useState(sections[0]?.key || "");

  const activeSection = useMemo(
    () => sections.find((s) => s.key === active) || sections[0],
    [sections, active]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] border transition-all ${
              active === s.key
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {activeSection && (
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-headline-md text-2xl">{activeSection.title}</h2>
          <p className="text-slate-400 mt-2 max-w-3xl">{activeSection.description}</p>
        </div>
      )}

      {activeSection && <CardsLandingClient cards={activeSection.cards} />}
    </div>
  );
}

