"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard } from "../data/cardsData";
import { getApplyUrl } from "../../lib/applyLinks";

interface DetailDrawerProps {
  card: CreditCard | null;
  onClose: () => void;
  onCompareToggle: (id: string) => void;
  isCompared: boolean;
}

const REWARD_ICONS: Record<string, string> = {
  travel: "✈️", dining: "🍽️", fuel: "⛽", groceries: "🛒",
  "online shopping": "🛍️", jewelry: "💎", entertainment: "🎬",
  utilities: "🔌", international: "🌐", general: "💳",
};

const APPROVAL_COLORS: Record<string, { dot: string; text: string }> = {
  easy: { dot: "bg-emerald-500", text: "text-emerald-400" },
  moderate: { dot: "bg-amber-500", text: "text-amber-400" },
  premium: { dot: "bg-red-500", text: "text-red-400" },
};

export default function DetailDrawer({ card, onClose, onCompareToggle, isCompared }: DetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (card) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      drawerRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [card, onClose]);

  return (
    <AnimatePresence>
      {card && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Drawer - right on desktop, bottom on mobile */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-surface-container-low border-l border-white/10 z-[70] overflow-y-auto shadow-2xl focus:outline-none"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
              aria-label="Close details"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Card Image */}
            <div className="relative h-56 bg-gradient-to-br from-surface-container-high to-surface overflow-hidden">
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <div className="flex justify-between items-start">
                  <span className="text-white/80 text-sm font-bold tracking-widest uppercase">{card.issuer}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    card.network === "Visa" ? "bg-blue-900/60 border border-blue-500/30 text-blue-300" :
                    card.network === "Mastercard" ? "bg-orange-900/60 border border-orange-500/30 text-orange-300" :
                    card.network === "Amex" ? "bg-indigo-900/60 border border-indigo-500/30 text-indigo-300" :
                    "bg-green-900/60 border border-green-500/30 text-green-300"
                  }`}>
                    {card.network}
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-lg text-2xl text-white">{card.name}</h2>
                  <p className="text-white/50 text-xs tracking-widest uppercase mt-1">CREDIT CARD • {card.issuer}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Best For */}
              <div className="flex items-center gap-2 text-primary">
                <span>★</span>
                <span className="italic font-body-md">{card.bestFor}</span>
              </div>

              {/* Fee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Annual Fee</span>
                  {card.annualFee === 0 ? (
                    <span className="text-lg font-bold text-emerald-400">Lifetime Free</span>
                  ) : (
                    <span className="text-lg font-bold text-on-surface">₹{card.annualFee.toLocaleString()}</span>
                  )}
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Joining Fee</span>
                  {card.joiningFee === 0 ? (
                    <span className="text-lg font-bold text-emerald-400">Free</span>
                  ) : (
                    <span className="text-lg font-bold text-on-surface">₹{card.joiningFee.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Welcome Bonus */}
              {card.welcomeBonus && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <span className="text-[10px] text-primary/70 uppercase tracking-wider block mb-1">Welcome Bonus</span>
                  <span className="text-sm text-primary">{card.welcomeBonus}</span>
                </div>
              )}

              {/* Reward Rate */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Reward Rate</span>
                <p className="text-sm text-on-surface">{card.rewardRate}</p>
              </div>

              {/* Key Benefits */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Key Benefits</span>
                <ul className="space-y-2">
                  {card.keyBenefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-primary mt-1 text-[8px]">●</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reward Categories */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Reward Categories</span>
                <div className="flex flex-wrap gap-2">
                  {card.rewardCategories.map((cat) => (
                    <span key={cat} className="text-xs px-3 py-1.5 rounded-full bg-primary/5 text-primary/80 border border-primary/10">
                      {REWARD_ICONS[cat] || "💳"} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${card.loungeAccess ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5"}`}>
                  <span className="material-symbols-outlined text-sm" style={{ color: card.loungeAccess ? "#34d399" : "#64748b" }}>flight_class</span>
                  <span className={`text-xs ${card.loungeAccess ? "text-emerald-400" : "text-slate-500"}`}>
                    Lounge {card.loungeAccess ? "✓" : "✗"}
                  </span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${card.fuelSurchargeWaiver ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5"}`}>
                  <span className="material-symbols-outlined text-sm" style={{ color: card.fuelSurchargeWaiver ? "#34d399" : "#64748b" }}>local_gas_station</span>
                  <span className={`text-xs ${card.fuelSurchargeWaiver ? "text-emerald-400" : "text-slate-500"}`}>
                    Fuel Waiver {card.fuelSurchargeWaiver ? "✓" : "✗"}
                  </span>
                </div>
              </div>

              {/* Approval */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Approval:</span>
                <span className={`w-2.5 h-2.5 rounded-full ${APPROVAL_COLORS[card.approvalDifficulty].dot}`} />
                <span className={`text-sm capitalize ${APPROVAL_COLORS[card.approvalDifficulty].text}`}>
                  {card.approvalDifficulty}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <a
                  href={getApplyUrl(card)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center gold-gradient text-on-primary py-3.5 rounded-xl text-xs font-label-sm uppercase tracking-[0.15em] hover:shadow-[0_0_20px_rgba(242,202,80,0.3)] transition-all duration-300"
                >
                  Apply Now →
                </a>
                <button
                  onClick={() => onCompareToggle(card.id)}
                  className={`px-6 py-3.5 rounded-xl text-xs font-label-sm uppercase tracking-[0.15em] border transition-all duration-300 ${
                    isCompared
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "border-white/10 text-slate-400 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {isCompared ? "✓ Compared" : "Compare"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
