"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CreditCard } from "./data/cardsData";
import FilterPanel from "./components/FilterPanel";
import CardGridItem from "./components/CardGridItem";
import CardListItem from "./components/CardListItem";
import DetailDrawer from "./components/DetailDrawer";
import CompareBar from "./components/CompareBar";
import CompareModal from "./components/CompareModal";
import InsightStrip from "./components/InsightStrip";
import { useAdvisor } from "./components/AICardAdvisor/AdvisorContext";
import { Sparkles, ArrowRight } from "lucide-react";
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

function matchesFeeFilter(fee: number, filterVal: string): boolean {
  switch (filterVal) {
    case "Free (₹0)": return fee === 0;
    case "Under ₹1,000": return fee > 0 && fee < 1000;
    case "₹1,000–₹5,000": return fee >= 1000 && fee <= 5000;
    case "Above ₹5,000": return fee > 5000;
    default: return true;
  }
}

export default function ExplorePage() {
  const { setIsOpen } = useAdvisor();
  const { mergedCards: cardsData } = useCardCatalog();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    spendingCategory: [] as string[],
    cardType: [] as string[],
    approvalDifficulty: [] as string[],
    annualFee: [] as string[],
    bank: [] as string[],
  });
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [detailCard, setDetailCard] = useState<CreditCard | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(false), 400);
    return () => clearTimeout(t);
  }, []);

  const handleFilterChange = useCallback((category: string, value: string) => {
    setFilters((prev) => {
      const key = category as keyof typeof prev;
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ spendingCategory: [], cardType: [], approvalDifficulty: [], annualFee: [], bank: [] });
  }, []);

  const bankOptions = useMemo(
    () => Array.from(new Set(cardsData.map((card) => card.issuer))).sort((a, b) => a.localeCompare(b)),
    [cardsData]
  );

  const activeFilterCount = useMemo(
    () => Object.values(filters).flat().length,
    [filters]
  );

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

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const filteredAndSorted = useMemo(() => {
    let result = [...cardsData];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q)
      );
    }

    // Spending Category (OR within, AND across)
    if (filters.spendingCategory.length > 0) {
      result = result.filter((c) =>
        filters.spendingCategory.some((f) =>
          c.rewardCategories.includes(f.toLowerCase())
        )
      );
    }

    // Card Type
    if (filters.cardType.length > 0) {
      result = result.filter((c) =>
        filters.cardType.some((f) => c.cardType.includes(f.toLowerCase()))
      );
    }

    // Approval Difficulty
    if (filters.approvalDifficulty.length > 0) {
      result = result.filter((c) =>
        filters.approvalDifficulty.some((f) => c.approvalDifficulty === f.toLowerCase())
      );
    }

    // Annual Fee
    if (filters.annualFee.length > 0) {
      result = result.filter((c) =>
        filters.annualFee.some((f) => matchesFeeFilter(c.annualFee, f))
      );
    }

    // Bank
    if (filters.bank.length > 0) {
      result = result.filter((c) => filters.bank.includes(c.issuer));
    }

    // Sort
    switch (sort) {
      case "popular": result.sort((a, b) => b.popularityScore - a.popularityScore); break;
      case "rewards": result.sort((a, b) => b.rewardStrengthScore - a.rewardStrengthScore); break;
      case "beginner": result.sort((a, b) => b.beginnerScore - a.beginnerScore); break;
      case "fee-asc": result.sort((a, b) => a.annualFee - b.annualFee); break;
      case "fee-desc": result.sort((a, b) => b.annualFee - a.annualFee); break;
    }

    return result;
  }, [search, sort, filters]);

  const compareCards = useMemo(
    () => compareIds.map((id) => cardsData.find((c) => c.id === id)!).filter(Boolean),
    [compareIds]
  );

  return (
    <main className="relative min-h-screen">
      {/* Section Header */}
      <div className="pt-32 pb-8 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-body-md">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <span>/</span>
          <span className="text-slate-400">Explore Cards</span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display-xl text-4xl md:text-display-xl text-on-background italic mb-3"
        >
          Explore Credit Cards
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-body-lg text-body-lg text-on-surface-variant opacity-80 max-w-2xl"
        >
          Find the perfect card for your lifestyle — no sign-up needed
        </motion.p>
      </div>

      {/* Sticky Top Controls Bar */}
      <div className="sticky top-[88px] z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            {/* Left: Search */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
              <input
                type="text"
                placeholder="Search by card name or bank..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-body-md"
              />
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Results count */}
              <span className="text-xs text-slate-500 font-body-md whitespace-nowrap">
                Showing {filteredAndSorted.length} of {cardsData.length} cards
              </span>

              {/* Sort */}
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

              {/* Filter toggle */}
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-label-sm uppercase tracking-wider border transition-all duration-300 ${
                  filterOpen
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                }`}
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </button>

              {/* View toggle */}
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

          {/* Filter Panel */}
          <FilterPanel
            isOpen={filterOpen}
            filters={filters}
            bankOptions={bankOptions}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearFilters}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 space-y-6">
        
        {/* Contextual AI Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" />
          <div className="flex gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-semibold text-white mb-1">
                Not sure which card fits your next purchase?
              </h3>
              <p className="text-sm text-slate-400 font-body-md max-w-xl">
                Tell our AI Advisor what you're planning to spend on and get an instant, personalized card recommendation.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(true)}
            className="relative z-10 whitespace-nowrap bg-white/5 hover:bg-primary/20 text-white hover:text-primary border border-white/10 hover:border-primary/50 px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 group/btn"
          >
            Ask AI Advisor
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Insight Strip */}
        <InsightStrip cards={filteredAndSorted} />

        {/* Skeleton / Empty / Grid */}
        {showSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                <div className="h-44 bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-5/6" />
                  <div className="h-10 bg-white/5 rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">credit_card_off</span>
            <h3 className="font-headline-md text-lg text-on-surface mb-2">No cards match your filters</h3>
            <p className="text-sm text-slate-500 font-body-md mb-6">Try adjusting or clearing them.</p>
            <button
              onClick={handleClearFilters}
              className="text-primary text-sm hover:underline font-body-md"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredAndSorted.map((card) => (
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
                    badges={getCardBadges(card, cardsData)}
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
              {filteredAndSorted.map((card) => (
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
                    badges={getCardBadges(card, cardsData)}
                    onCompareToggle={handleCompareToggle}
                    isCompared={compareIds.includes(card.id)}
                    onViewDetails={setDetailCard}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom spacing for compare bar */}
      {compareIds.length > 0 && <div className="h-20" />}

      {/* Detail Drawer */}
      <DetailDrawer
        card={detailCard}
        onClose={() => setDetailCard(null)}
        onCompareToggle={handleCompareToggle}
        isCompared={detailCard ? compareIds.includes(detailCard.id) : false}
      />

      {/* Compare Bar */}
      <CompareBar
        selectedCards={compareCards}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        onClear={() => setCompareIds([])}
        onCompareNow={() => setCompareOpen(true)}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={compareOpen}
        cards={compareCards}
        onClose={() => setCompareOpen(false)}
      />

      {/* Toast */}
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
    </main>
  );
}
