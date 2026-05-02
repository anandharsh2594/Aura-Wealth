"use client";

import { CreditCard } from "../data/cardsData";
import { useAdvisor } from "./AICardAdvisor/AdvisorContext";
import { Sparkles } from "lucide-react";
import { getApplyUrl } from "../../lib/applyLinks";
interface CardListItemProps {
  card: CreditCard;
  badges: string[];
  onCompareToggle: (id: string) => void;
  isCompared: boolean;
  onViewDetails: (card: CreditCard) => void;
}

const REWARD_ICONS: Record<string, string> = {
  travel: "✈️", dining: "🍽️", fuel: "⛽", groceries: "🛒",
  "online shopping": "🛍️", jewelry: "💎", entertainment: "🎬",
  utilities: "🔌", international: "🌐", general: "💳",
};

const APPROVAL_COLORS: Record<string, string> = {
  easy: "bg-emerald-500", moderate: "bg-amber-500", premium: "bg-red-500",
};

export default function CardListItem({ card, badges, onCompareToggle, isCompared, onViewDetails }: CardListItemProps) {
  const { openWithQuery } = useAdvisor();
  return (
    <div
      className="glass-card rounded-2xl p-4 md:p-5 group transition-all duration-500 hover:border-primary/40 hover:shadow-[0_5px_20px_rgba(212,175,55,0.06)] border border-white/10 flex flex-col sm:flex-row gap-4 items-center"
      aria-label={`${card.name} by ${card.issuer}`}
    >
      {/* Left: Card image area */}
      <div className="relative w-full sm:w-36 h-24 sm:h-20 bg-gradient-to-br from-surface-container-high to-surface-container rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
        {badges.length > 0 && (
          <span className={`absolute top-1.5 left-1.5 z-10 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            badges[0] === "Top Pick" ? "bg-amber-500/90 text-black" :
            badges[0] === "Best Rewards" ? "bg-purple-500/90 text-white" :
            badges[0] === "Beginner Friendly" ? "bg-teal-500/90 text-white" :
            badges[0] === "No Annual Fee" ? "bg-emerald-500/90 text-white" :
            "bg-slate-700/90 text-white"
          }`}>
            {badges[0]}
          </span>
        )}
        <div className="text-center">
          <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase block">{card.issuer}</span>
          <span className="text-white/20 text-[8px] tracking-wider uppercase">{card.network}</span>
        </div>
      </div>

      {/* Center: Info */}
      <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <h3 className="font-headline-md text-sm text-on-surface group-hover:text-primary transition-colors duration-300 truncate">
            {card.name}
          </h3>
          <span className="text-[10px] text-slate-500">{card.issuer}</span>
        </div>
        <p className="text-xs text-primary/70 italic">★ {card.bestFor}</p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-1">
          {card.keyBenefits.slice(0, 2).map((b, i) => (
            <span key={i} className="text-[10px] text-slate-400">• {b}</span>
          ))}
        </div>
      </div>

      {/* Right: Fee, approval, categories, CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
        {/* Reward chips */}
        <div className="flex flex-wrap gap-1 justify-center">
          {card.rewardCategories.slice(0, 3).map((cat) => (
            <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/5 text-primary/60 border border-primary/10">
              {REWARD_ICONS[cat] || "💳"}
            </span>
          ))}
        </div>

        {/* Fee */}
        <div className="text-center sm:text-right w-24">
          {card.annualFee === 0 ? (
            <span className="text-xs font-bold text-emerald-400">Lifetime Free</span>
          ) : (
            <span className="text-xs text-on-surface">₹{card.annualFee.toLocaleString()}<span className="text-slate-500">/yr</span></span>
          )}
          <div className="flex items-center gap-1 justify-center sm:justify-end mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${APPROVAL_COLORS[card.approvalDifficulty]}`} />
            <span className="text-[9px] text-slate-500 capitalize">{card.approvalDifficulty}</span>
          </div>
        </div>

        {/* Compare checkbox */}
        <label className="cursor-pointer flex items-center gap-1">
          <input type="checkbox" checked={isCompared} onChange={() => onCompareToggle(card.id)} className="sr-only" />
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
            isCompared ? "bg-primary border-primary" : "border-white/30"
          }`}>
            {isCompared && <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
        </label>

        {/* Apply button */}
        <div className="flex gap-2">
          <a
            href={getApplyUrl(card)}
            target="_blank"
            rel="noopener noreferrer"
            className="gold-gradient text-on-primary px-4 py-2 rounded-xl text-[10px] font-label-sm uppercase tracking-[0.12em] hover:shadow-[0_0_15px_rgba(242,202,80,0.3)] transition-all duration-300 whitespace-nowrap"
          >
            Apply Now →
          </a>

          <button
            onClick={() => onViewDetails(card)}
            className="border border-white/10 text-slate-400 px-3 py-2 rounded-xl text-[10px] font-label-sm uppercase tracking-wider hover:border-primary/40 hover:text-primary transition-all duration-300"
          >
            Details
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              openWithQuery(`Tell me the best use cases and top purchases to maximize the ${card.name} credit card`);
            }}
            className="border border-primary/20 bg-primary/5 text-primary px-3 py-2 rounded-xl text-[10px] hover:bg-primary/10 transition-all duration-300 flex items-center gap-1.5"
            title="Ask AI about this card"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden lg:inline uppercase tracking-wider font-label-sm text-[10px]">Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
