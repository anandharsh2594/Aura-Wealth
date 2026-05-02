"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FilterPanelProps {
  isOpen: boolean;
  filters: {
    spendingCategory: string[];
    cardType: string[];
    approvalDifficulty: string[];
    annualFee: string[];
    bank: string[];
  };
  bankOptions: string[];
  onFilterChange: (category: string, value: string) => void;
  onClearAll: () => void;
}

const FILTER_CONFIG = {
  spendingCategory: {
    label: "Spending Category",
    options: ["Travel", "Dining", "Fuel", "Groceries", "Online Shopping", "Jewelry", "Entertainment", "Utilities", "International"],
  },
  cardType: {
    label: "Card Type",
    options: ["Lifestyle", "Premium", "Beginner", "Cashback", "Travel", "Fuel", "Business", "Secured"],
  },
  approvalDifficulty: {
    label: "Approval Difficulty",
    options: ["Easy", "Moderate", "Premium"],
  },
  annualFee: {
    label: "Annual Fee",
    options: ["Free (₹0)", "Under ₹1,000", "₹1,000–₹5,000", "Above ₹5,000"],
  },
};

export default function FilterPanel({ isOpen, filters, bankOptions, onFilterChange, onClearAll }: FilterPanelProps) {
  const totalActive = Object.values(filters).flat().length;
  const filterConfig = {
    ...FILTER_CONFIG,
    bank: {
      label: "Bank",
      options: bankOptions,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="glass-card rounded-2xl p-6 md:p-8 mt-4 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-label-sm text-label-sm text-on-surface uppercase tracking-[0.2em]">
                Refine Results
              </h3>
              {totalActive > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-primary text-sm hover:text-primary-fixed transition-colors duration-300 font-body-md"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="space-y-5">
              {(Object.keys(filterConfig) as Array<keyof typeof filterConfig>).map((key) => {
                const config = filterConfig[key];
                const activeValues = filters[key] || [];
                return (
                  <div key={key} className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <span className="text-sm text-slate-400 font-label-sm tracking-wider uppercase w-40 shrink-0">
                      {config.label}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {config.options.map((option) => {
                        const isActive = activeValues.includes(option);
                        return (
                          <button
                            key={option}
                            onClick={() => onFilterChange(key, option)}
                            aria-pressed={isActive}
                            className={`px-4 py-1.5 rounded-full text-xs font-body-md transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                              isActive
                                ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(242,202,80,0.15)]"
                                : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
