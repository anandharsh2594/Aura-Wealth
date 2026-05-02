"use client";

import { CreditCard } from "../data/cardsData";

interface InsightStripProps {
  cards: CreditCard[];
}

export default function InsightStrip({ cards }: InsightStripProps) {
  if (cards.length === 0) return null;

  const freeCards = cards.filter((c) => c.annualFee === 0).length;
  const loungeCards = cards.filter((c) => c.loungeAccess).length;
  const avgFee = Math.round(cards.reduce((a, c) => a + c.annualFee, 0) / cards.length);
  const beginnerCards = cards.filter((c) => c.beginnerScore >= 80).length;
  const cashbackCards = cards.filter((c) => c.cardType.includes("cashback")).length;

  const insights = [
    { icon: "🆓", text: `${freeCards} card${freeCards !== 1 ? "s" : ""} with no annual fee` },
    { icon: "🛋️", text: `${loungeCards} card${loungeCards !== 1 ? "s" : ""} with lounge access` },
    { icon: "💰", text: `Avg annual fee: ₹${avgFee.toLocaleString()}` },
    { icon: "🌱", text: `${beginnerCards} beginner-friendly pick${beginnerCards !== 1 ? "s" : ""}` },
    { icon: "💸", text: `${cashbackCards} cashback card${cashbackCards !== 1 ? "s" : ""}` },
  ].filter((i) => {
    if (i.text.startsWith("0 ")) return false;
    return true;
  });

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
      {insights.map((insight, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 shrink-0 text-xs text-slate-300"
        >
          <span>{insight.icon}</span>
          <span className="whitespace-nowrap font-body-md">{insight.text}</span>
        </div>
      ))}
    </div>
  );
}
