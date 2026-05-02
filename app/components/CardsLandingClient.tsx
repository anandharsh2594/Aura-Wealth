"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CreditCard } from "../explore/data/cardsData";
import CardGridItem from "../explore/components/CardGridItem";
import CardListItem from "../explore/components/CardListItem";
import DetailDrawer from "../explore/components/DetailDrawer";
import CompareBar from "../explore/components/CompareBar";
import CompareModal from "../explore/components/CompareModal";
import { useCardCatalog } from "../lib/userCards";

type SortOption = "popular" | "rewards" | "beginner" | "fee-asc" | "fee-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "rewards", label: "Highest Rewards" },
  { value: "beginner", label: "Beginner Friendly" },
  { value: "fee-asc", label: "Annual Fee: Low to High" },
  { value: "fee-desc", label: "Annual Fee: High to Low" },
];

function getCardBadges(card: CreditCard, allCards: CreditCard[]): string[] {
  const badges: string[] = [];
  const sortedByPop = [...allCards].sort((a, b) => b.popularityScore - a.popularityScore);
  const sortedByReward = [...allCards].sort((a, b) => b.rewardStrengthScore - a.rewardStrengthScore);

  if (sortedByPop.indexOf(card) < 3) badges.push("Top Pick");
  if (sortedByReward.indexOf(card) < 2) badges.push("Best Rewards");
  if (card.beginnerScore >= 80) badges.push("Beginner Friendly");
  if (card.annualFee === 0) badges.push("No Annual Fee");
  if (card.approvalDifficulty === "premium") badges.push("Premium");

  return badges;
}

export default function CardsLandingClient({
  cards,
  defaultSort = "popular",
  showCount = true,
}: {
  cards: CreditCard[];
  defaultSort?: SortOption;
  showCount?: boolean;
}) {
  const { mergedCards } = useCardCatalog();
  const [sort, setSort] = useState<SortOption>(defaultSort);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [detailCard, setDetailCard] = useState<CreditCard | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleCompareToggle = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        setToast("You can compare up to 3 cards at a time");
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const compareCards = useMemo(
    () => compareIds.map((id) => mergedCards.find((c) => c.id === id)!).filter(Boolean),
    [compareIds]
  );

  const sortedCards = useMemo(() => {
    const result = [...cards];
    switch (sort) {
      case "popular": result.sort((a, b) => b.popularityScore - a.popularityScore); break;
      case "rewards": result.sort((a, b) => b.rewardStrengthScore - a.rewardStrengthScore); break;
      case "beginner": result.sort((a, b) => b.beginnerScore - a.beginnerScore); break;
      case "fee-asc": result.sort((a, b) => a.annualFee - b.annualFee); break;
      case "fee-desc": result.sort((a, b) => b.annualFee - a.annualFee); break;
    }
    return result;
  }, [cards, sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {showCount && (
            <span className="text-xs text-slate-500 font-body-md whitespace-nowrap">
              Showing {sortedCards.length} cards
            </span>
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50 font-body-md cursor-pointer appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "16px", paddingRight: "32px" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-all ${viewMode === "grid" ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300"}`}
              aria-label="Grid view"
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-all ${viewMode === "list" ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300"}`}
              aria-label="List view"
            >
              <span className="material-symbols-outlined text-sm">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {sortedCards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <CardGridItem
                  card={card}
                  badges={getCardBadges(card, mergedCards)}
                  onCompareToggle={handleCompareToggle}
                  isCompared={compareIds.includes(card.id)}
                  onViewDetails={setDetailCard}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedCards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CardListItem
                  card={card}
                  badges={getCardBadges(card, mergedCards)}
                  onCompareToggle={handleCompareToggle}
                  isCompared={compareIds.includes(card.id)}
                  onViewDetails={setDetailCard}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {compareIds.length > 0 && <div className="h-20" />}

      <DetailDrawer
        card={detailCard}
        onClose={() => setDetailCard(null)}
        onCompareToggle={handleCompareToggle}
        isCompared={detailCard ? compareIds.includes(detailCard.id) : false}
      />

      <CompareBar
        selectedCards={compareCards}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        onClear={() => setCompareIds([])}
        onCompareNow={() => setCompareOpen(true)}
      />

      <CompareModal
        isOpen={compareOpen}
        cards={compareCards}
        onClose={() => setCompareOpen(false)}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-red-500/90 text-white px-6 py-3 rounded-xl text-sm font-body-md shadow-2xl backdrop-blur-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

