"use client";

import { CreditCard } from "../data/cardsData";
import { useAdvisor } from "./AICardAdvisor/AdvisorContext";
import { Sparkles } from "lucide-react";
import { getApplyUrl } from "../../lib/applyLinks";
interface CardGridItemProps {
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

export default function CardGridItem({ card, badges, onCompareToggle, isCompared, onViewDetails }: CardGridItemProps) {
  const { openWithQuery } = useAdvisor();
  return (
    <div
      className="glass-card rounded-2xl overflow-hidden group transition-all duration-500 hover:border-primary/40 hover:shadow-[0_10px_40px_rgba(212,175,55,0.08)] hover:-translate-y-1 border border-white/10 flex flex-col"
      aria-label={`${card.name} by ${card.issuer}`}
    >
      {/* Card Image Area */}
      <div className="relative h-44 bg-gradient-to-br from-surface-container-high to-surface-container overflow-hidden">
        {/* Badge overlay top-left */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  badge === "Top Pick" ? "bg-amber-500/90 text-black" :
                  badge === "Best Rewards" ? "bg-purple-500/90 text-white" :
                  badge === "Beginner Friendly" ? "bg-teal-500/90 text-white" :
                  badge === "No Annual Fee" ? "bg-emerald-500/90 text-white" :
                  "bg-slate-700/90 text-white"
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Compare checkbox top-right */}
        <label className="absolute top-3 right-3 z-10 flex items-center gap-1.5 cursor-pointer group/check">
          <input
            type="checkbox"
            checked={isCompared}
            onChange={() => onCompareToggle(card.id)}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
            isCompared ? "bg-primary border-primary" : "border-white/30 bg-black/30 backdrop-blur group-hover/check:border-primary/60"
          }`}>
            {isCompared && (
              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Compare</span>
        </label>

        {/* Lounge badge */}
        {card.loungeAccess && (
          <div className="absolute bottom-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-primary text-[10px] px-2 py-1 rounded-full flex items-center gap-1 border border-primary/20">
            <span className="material-symbols-outlined text-xs">flight_class</span>
            Lounge
          </div>
        )}

        {/* Network badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
            card.network === "Visa" ? "bg-blue-900/60 border-blue-500/30 text-blue-300" :
            card.network === "Mastercard" ? "bg-orange-900/60 border-orange-500/30 text-orange-300" :
            card.network === "Amex" ? "bg-indigo-900/60 border-indigo-500/30 text-indigo-300" :
            "bg-green-900/60 border-green-500/30 text-green-300"
          }`}>
            {card.network}
          </span>
        </div>

        {/* Card visual placeholder */}
        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <div className="flex justify-between items-start">
            <span className="text-white/70 text-xs font-bold tracking-widest uppercase">{card.issuer}</span>
            <div className="w-8 h-5 rounded bg-gradient-to-br from-yellow-200 to-yellow-600 opacity-60" />
          </div>
          <div>
            <span className="text-white/50 text-[10px] tracking-[0.3em] uppercase">CREDIT CARD</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Name & Issuer */}
        <div>
          <h3 className="font-headline-md text-lg text-on-surface group-hover:text-primary transition-colors duration-300 leading-tight">
            {card.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{card.issuer}</p>
        </div>

        {/* Best For */}
        <div className="flex items-start gap-1.5 text-xs text-primary/80">
          <span>★</span>
          <span className="italic font-body-md">{card.bestFor}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
              {tag}
            </span>
          ))}
        </div>

        {/* Key Benefits */}
        <ul className="space-y-1 text-xs text-slate-300 flex-1">
          {card.keyBenefits.slice(0, 3).map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5 text-[8px]">●</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Reward Categories */}
        <div className="flex flex-wrap gap-1.5">
          {card.rewardCategories.slice(0, 4).map((cat) => (
            <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary/70 border border-primary/10">
              {REWARD_ICONS[cat] || "💳"} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          ))}
        </div>

        {/* Fee & Approval */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            {card.annualFee === 0 ? (
              <span className="text-sm font-bold text-emerald-400">Lifetime Free</span>
            ) : (
              <span className="text-sm text-on-surface">
                ₹{card.annualFee.toLocaleString()}
                <span className="text-slate-500 text-xs"> / year</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${APPROVAL_COLORS[card.approvalDifficulty]}`} />
            <span className="text-[10px] text-slate-400 capitalize">{card.approvalDifficulty}</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-2 pt-2">
          <a
            href={getApplyUrl(card)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center gold-gradient text-on-primary py-2.5 rounded-xl text-xs font-label-sm uppercase tracking-[0.15em] hover:shadow-[0_0_20px_rgba(242,202,80,0.3)] transition-all duration-300"
          >
            Apply Now →
          </a>
          <button
            onClick={() => onViewDetails(card)}
            className="flex-1 text-center border border-white/10 text-slate-300 py-2.5 rounded-xl text-xs font-label-sm uppercase tracking-[0.15em] hover:border-primary/40 hover:text-primary transition-all duration-300"
          >
            View Details
          </button>
        </div>
        
        {/* AI Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openWithQuery(`Tell me the best use cases and top purchases to maximize the ${card.name} credit card`);
          }}
          className="w-full mt-1 flex items-center justify-center gap-2 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary py-2 rounded-xl text-xs font-label-sm uppercase tracking-wider transition-colors duration-300"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask AI about this card
        </button>
      </div>
    </div>
  );
}
