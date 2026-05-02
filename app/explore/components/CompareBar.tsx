"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CreditCard } from "../data/cardsData";

interface CompareBarProps {
  selectedCards: CreditCard[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompareNow: () => void;
}

export default function CompareBar({ selectedCards, onRemove, onClear, onCompareNow }: CompareBarProps) {
  return (
    <AnimatePresence>
      {selectedCards.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low/95 backdrop-blur-xl border-t border-primary/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-label-sm shrink-0">
                Compare ({selectedCards.length}/3):
              </span>
              {selectedCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 shrink-0"
                >
                  <span className="text-xs text-on-surface truncate max-w-[120px]">{card.name}</span>
                  <button
                    onClick={() => onRemove(card.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${card.name} from comparison`}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors font-body-md"
              >
                Clear
              </button>
              <button
                onClick={onCompareNow}
                disabled={selectedCards.length < 2}
                className="gold-gradient text-on-primary px-6 py-2.5 rounded-xl text-xs font-label-sm uppercase tracking-[0.15em] hover:shadow-[0_0_20px_rgba(242,202,80,0.3)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Compare Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
