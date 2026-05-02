"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard } from "../data/cardsData";
import { getApplyUrl } from "../../lib/applyLinks";

interface CompareModalProps {
  isOpen: boolean;
  cards: CreditCard[];
  onClose: () => void;
}

const APPROVAL_COLORS: Record<string, string> = {
  easy: "text-emerald-400", moderate: "text-amber-400", premium: "text-red-400",
};

function bestValue(cards: CreditCard[], getter: (c: CreditCard) => number, lower = true): number {
  const vals = cards.map(getter);
  return lower ? Math.min(...vals) : Math.max(...vals);
}

export default function CompareModal({ isOpen, cards, onClose }: CompareModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const rows: { label: string; getValue: (c: CreditCard) => string; highlight?: (c: CreditCard) => boolean }[] = [
    { label: "Issuer", getValue: (c) => c.issuer },
    { label: "Network", getValue: (c) => c.network },
    {
      label: "Annual Fee",
      getValue: (c) => c.annualFee === 0 ? "Lifetime Free" : `₹${c.annualFee.toLocaleString()}`,
      highlight: (c) => c.annualFee === bestValue(cards, (x) => x.annualFee, true),
    },
    {
      label: "Joining Fee",
      getValue: (c) => c.joiningFee === 0 ? "Free" : `₹${c.joiningFee.toLocaleString()}`,
      highlight: (c) => c.joiningFee === bestValue(cards, (x) => x.joiningFee, true),
    },
    { label: "Best For", getValue: (c) => c.bestFor },
    { label: "Reward Rate", getValue: (c) => c.rewardRate },
    {
      label: "Reward Strength",
      getValue: (c) => `${c.rewardStrengthScore}/100`,
      highlight: (c) => c.rewardStrengthScore === bestValue(cards, (x) => x.rewardStrengthScore, false),
    },
    {
      label: "Popularity",
      getValue: (c) => `${c.popularityScore}/100`,
      highlight: (c) => c.popularityScore === bestValue(cards, (x) => x.popularityScore, false),
    },
    {
      label: "Beginner Score",
      getValue: (c) => `${c.beginnerScore}/100`,
      highlight: (c) => c.beginnerScore === bestValue(cards, (x) => x.beginnerScore, false),
    },
    { label: "Welcome Bonus", getValue: (c) => c.welcomeBonus || "—" },
    { label: "Lounge Access", getValue: (c) => c.loungeAccess ? "✓ Yes" : "✗ No", highlight: (c) => c.loungeAccess },
    { label: "Fuel Waiver", getValue: (c) => c.fuelSurchargeWaiver ? "✓ Yes" : "✗ No", highlight: (c) => c.fuelSurchargeWaiver },
    {
      label: "Approval",
      getValue: (c) => c.approvalDifficulty.charAt(0).toUpperCase() + c.approvalDifficulty.slice(1),
    },
    { label: "Card Types", getValue: (c) => c.cardType.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ") },
    { label: "Key Benefits", getValue: (c) => c.keyBenefits.join(" · ") },
    { label: "Reward Categories", getValue: (c) => c.rewardCategories.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(", ") },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
            onClick={onClose}
          />
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-8 md:inset-12 z-[90] bg-surface-container-low border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col focus:outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <h2 className="font-headline-md text-lg text-on-surface">Card Comparison</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                aria-label="Close comparison"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <table className="w-full border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider py-3 px-4 font-label-sm sticky left-0 bg-surface-container-low z-10 w-40">
                      Feature
                    </th>
                    {cards.map((card) => (
                      <th key={card.id} className="text-center py-3 px-4">
                        <div className="text-sm font-headline-md text-primary">{card.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{card.issuer}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="text-xs text-slate-400 py-3 px-4 font-label-sm uppercase tracking-wider sticky left-0 bg-surface-container-low z-10 border-r border-white/5">
                        {row.label}
                      </td>
                      {cards.map((card) => {
                        const isHighlighted = row.highlight?.(card);
                        return (
                          <td
                            key={card.id}
                            className={`text-xs text-center py-3 px-4 ${
                              isHighlighted ? "text-emerald-400 font-bold bg-emerald-500/5" : "text-slate-300"
                            }`}
                          >
                            {row.getValue(card)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-center gap-4 px-6 py-4 border-t border-white/10 shrink-0">
              {cards.map((card) => (
                <a
                  key={card.id}
                  href={getApplyUrl(card)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gold-gradient text-on-primary px-6 py-2.5 rounded-xl text-[10px] font-label-sm uppercase tracking-[0.12em] hover:shadow-[0_0_15px_rgba(242,202,80,0.3)] transition-all"
                >
                  Apply for {card.name.split(" ").slice(-1)} →
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
