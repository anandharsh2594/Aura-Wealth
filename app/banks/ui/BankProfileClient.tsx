"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";
import CardsLandingClient from "../../components/CardsLandingClient";
import { useCardCatalog } from "../../lib/userCards";
import { getIssuerBySlug } from "../../lib/cardCatalog";

export default function BankProfileClient({ bankSlug }: { bankSlug: string }) {
  const { mergedCards } = useCardCatalog();

  const issuer = useMemo(() => getIssuerBySlug(bankSlug), [bankSlug]);
  if (!issuer) return notFound();

  const bankCards = useMemo(
    () => mergedCards.filter((c) => c.issuer === issuer),
    [mergedCards, issuer]
  );

  if (bankCards.length === 0) return notFound();

  const premium = bankCards.filter((c) => c.approvalDifficulty === "premium").length;
  const free = bankCards.filter((c) => c.annualFee === 0).length;
  const lounge = bankCards.filter((c) => c.loungeAccess).length;

  return (
    <main className="relative min-h-screen">
      <div className="pt-32 pb-10 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-body-md">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/banks" className="hover:text-primary transition-colors">Banks</Link>
          <span>/</span>
          <span className="text-slate-400">{issuer}</span>
        </div>

        <h1 className="font-display-xl text-4xl md:text-display-xl text-on-background italic mb-3">
          {issuer}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant opacity-80 max-w-3xl">
          Explore the full {issuer} credit card catalog in your database — sorted, comparable, and optimized for your spending.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Cards: {bankCards.length} / {mergedCards.length}
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Lifetime free: {free}
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Lounge: {lounge}
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Premium approval: {premium}
          </span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-20">
        <CardsLandingClient cards={bankCards} />
      </div>
    </main>
  );
}

