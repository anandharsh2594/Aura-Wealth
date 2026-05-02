"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCardCatalog } from "../../lib/userCards";
import { buildIssuerSlugIndex } from "../../lib/cardCatalog";

export default function BanksClient() {
  const { mergedCards } = useCardCatalog();

  const banks = useMemo(() => {
    const byIssuer = new Map<string, string[]>();
    mergedCards.forEach((c) => {
      byIssuer.set(c.issuer, [...(byIssuer.get(c.issuer) || []), c.id]);
    });

    const { issuerToSlug } = buildIssuerSlugIndex(mergedCards);

    return Array.from(byIssuer.entries())
      .map(([issuer, ids]) => ({
        issuer,
        slug: issuerToSlug.get(issuer) || issuer.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        count: ids.length,
        topCardIds: ids.slice(0, 3),
      }))
      .sort((a, b) => b.count - a.count || a.issuer.localeCompare(b.issuer));
  }, [mergedCards]);

  return (
    <main className="relative min-h-screen">
      <div className="pt-32 pb-10 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-body-md">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Banks</span>
        </div>

        <h1 className="font-display-xl text-4xl md:text-display-xl text-on-background italic mb-3">
          Banks & Issuers
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant opacity-80 max-w-2xl">
          Browse the Indian credit card universe by issuer, then compare the best picks for cashback, travel, dining, and more.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Total cards: {mergedCards.length}
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Total issuers: {banks.length}
          </span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((b) => (
            <Link
              key={b.slug}
              href={`/banks/${b.slug}`}
              className="glass-card rounded-2xl border border-white/10 p-6 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(212,175,55,0.06)] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-headline-md text-lg">{b.issuer}</h3>
                  <p className="text-slate-500 text-xs mt-1">{b.count} card{b.count !== 1 ? "s" : ""}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider font-label-sm border border-primary/10">
                  View →
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {b.topCardIds.slice(0, 3).map((id) => (
                  <span key={id} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
                    {id}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

