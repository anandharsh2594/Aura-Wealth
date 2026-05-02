"use client";

import Link from "next/link";
import DealsClient from "../DealsClient";
import { useMemo } from "react";
import { useCardCatalog } from "../../lib/userCards";

export default function DealsClientPage() {
  const { mergedCards } = useCardCatalog();

  const sections = useMemo(() => {
    const loungeUnder1k = mergedCards
      .filter((c) => c.loungeAccess && c.annualFee > 0 && c.annualFee <= 1000)
      .sort((a, b) => b.rewardStrengthScore - a.rewardStrengthScore)
      .slice(0, 30);

    const bestFuel = mergedCards
      .filter((c) => c.rewardCategories.includes("fuel") || c.cardType.includes("fuel") || c.fuelSurchargeWaiver)
      .sort((a, b) => b.rewardStrengthScore - a.rewardStrengthScore)
      .slice(0, 30);

    const bestRupayUpi = mergedCards
      .filter((c) => c.network === "RuPay")
      .sort((a, b) => (b.popularityScore + b.beginnerScore) - (a.popularityScore + a.beginnerScore))
      .slice(0, 30);

    const lifetimeFreeTop = mergedCards
      .filter((c) => c.annualFee === 0)
      .sort((a, b) => (b.rewardStrengthScore + b.popularityScore) - (a.rewardStrengthScore + a.popularityScore))
      .slice(0, 30);

    const premiumTravel = mergedCards
      .filter((c) => (c.rewardCategories.includes("travel") || c.cardType.includes("travel")) && c.approvalDifficulty === "premium")
      .sort((a, b) => b.rewardStrengthScore - a.rewardStrengthScore)
      .slice(0, 30);

    return [
      {
        key: "lounge-under-1000",
        title: "Lounge Access under ₹1,000 fee",
        description: "Computed list: cards with lounge access and annual fee up to ₹1,000 — sorted by reward strength.",
        cards: loungeUnder1k,
      },
      {
        key: "best-fuel",
        title: "Best Fuel Cards",
        description: "Computed list: strong fuel category coverage or fuel surcharge waiver — sorted by reward strength.",
        cards: bestFuel,
      },
      {
        key: "best-rupay",
        title: "Best RuPay / UPI Picks",
        description: "Computed list: RuPay network cards (commonly used for UPI-linked credit) — sorted by popularity + beginner friendliness.",
        cards: bestRupayUpi,
      },
      {
        key: "lifetime-free",
        title: "Top Lifetime-Free Cards",
        description: "Computed list: ₹0 annual fee cards with the best overall reward and popularity balance.",
        cards: lifetimeFreeTop,
      },
      {
        key: "premium-travel",
        title: "Premium Travel Picks",
        description: "Computed list: premium-approval travel-focused cards — sorted by reward strength.",
        cards: premiumTravel,
      },
    ];
  }, [mergedCards]);

  return (
    <main className="relative min-h-screen">
      <div className="pt-32 pb-10 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-body-md">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Deals</span>
        </div>

        <h1 className="font-display-xl text-4xl md:text-display-xl text-on-background italic mb-3">
          Deals & Best Picks
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant opacity-80 max-w-3xl">
          Smart computed shortlists from your full database — filters you’d normally apply, surfaced as ready-made “deal views”.
        </p>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-20">
        <DealsClient sections={sections} />
      </div>
    </main>
  );
}

