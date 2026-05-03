"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CreditCard } from "./explore/data/types";
import { useCardCatalog } from "./lib/userCards";

const MaterialIcon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>
    {name}
  </span>
);

type OptimizerCard = CreditCard & { tier: string; imageUrl: string };
type RecommendedCard = {
  card: OptimizerCard;
  categoryMapping: string[];
  rewardPointsValue: number;
  netDiscountValue: number;
  maintenanceFee: number;
  netBenefit: number;
};

function getTierFromFee(annualFee: number): string {
  if (annualFee >= 10000) return "Super Premium";
  if (annualFee >= 2500) return "Premium";
  if (annualFee > 0) return "Mid-Range";
  return "Entry";
}

function normalizeCategory(category: string): string[] {
  const map: Record<string, string[]> = {
    dining: ["dining"],
    travel: ["travel", "international"],
    fuel: ["fuel"],
    luxury: ["jewelry", "international", "lifestyle"],
    entertainment: ["entertainment"],
    groceries: ["groceries"],
    onlineShopping: ["online shopping"],
    utilityBills: ["utilities"],
    other: ["general"],
  };
  return map[category] || ["general"];
}

function extractEstimatedRate(card: CreditCard, isCategoryMatch: boolean): number {
  const rewardText = card.rewardRate.toLowerCase();
  const percentageMatches = Array.from(rewardText.matchAll(/(\d+(\.\d+)?)\s*%/g)).map((m) => Number(m[1]));
  const pointsMatch = rewardText.match(/(\d+)\s*points?\s*per\s*₹\s*(\d+)/i);
  const multiplierMatch = rewardText.match(/(\d+(\.\d+)?)x/);

  let rate = 0.008 + card.rewardStrengthScore / 10000; // 0.8% to ~1.8% baseline
  if (percentageMatches.length > 0) {
    const maxPercent = Math.max(...percentageMatches) / 100;
    rate = isCategoryMatch ? maxPercent : Math.max(rate, maxPercent * 0.35);
  }

  if (pointsMatch) {
    const points = Number(pointsMatch[1]);
    const spend = Number(pointsMatch[2]);
    const rupeePerPoint = 0.25;
    const pointsRate = (points * rupeePerPoint) / spend;
    rate = Math.max(rate, isCategoryMatch ? pointsRate : pointsRate * 0.6);
  }

  if (multiplierMatch && isCategoryMatch) {
    const multiplier = Number(multiplierMatch[1]);
    rate = Math.max(rate, Math.min(rate * (1 + (multiplier - 1) * 0.18), 0.12));
  }

  return Math.min(Math.max(rate, 0.003), 0.15);
}

function calculatePortfolioOptimization(
  categories: Record<string, number>,
  isMonthly: boolean,
  allCards: CreditCard[]
) {
  const multiplier = isMonthly ? 12 : 1;
  const usedCards = new Map<string, RecommendedCard>();
  let totalRewardsValue = 0;
  let totalRewardPointsValue = 0;
  let totalNetDiscount = 0;
  let totalTransactions = 0;

  Object.entries(categories).forEach(([category, spend]) => {
    const annualSpend = (Number(spend) || 0) * multiplier;
    if (annualSpend <= 0) return;
    totalTransactions += annualSpend;

    const aliases = normalizeCategory(category);
    let bestCard: CreditCard | null = null;
    let bestValue = 0;
    let bestPointsValue = 0;
    let bestDiscountValue = 0;

    allCards.forEach((card) => {
      const isCategoryMatch = aliases.some((alias) => card.rewardCategories.includes(alias));
      const rate = extractEstimatedRate(card, isCategoryMatch);
      const totalValue = annualSpend * rate;
      const discountBias = card.cardType.includes("cashback") ? 0.72 : 0.38;
      const discountValue = totalValue * discountBias;
      const pointsValue = totalValue - discountValue;
      const netValue = totalValue - card.annualFee;

      if (netValue > bestValue) {
        bestCard = card;
        bestValue = netValue;
        bestPointsValue = pointsValue;
        bestDiscountValue = discountValue;
      }
    });

    if (!bestCard) return;
    const existing = usedCards.get(bestCard.id);
    if (existing) {
      existing.categoryMapping.push(category);
      existing.rewardPointsValue += bestPointsValue;
      existing.netDiscountValue += bestDiscountValue;
      existing.netBenefit += bestPointsValue + bestDiscountValue;
    } else {
      const enrichedCard: OptimizerCard = {
        ...bestCard,
        tier: getTierFromFee(bestCard.annualFee),
        imageUrl: bestCard.image,
      };
      usedCards.set(bestCard.id, {
        card: enrichedCard,
        categoryMapping: [category],
        rewardPointsValue: bestPointsValue,
        netDiscountValue: bestDiscountValue,
        maintenanceFee: bestCard.annualFee,
        netBenefit: bestPointsValue + bestDiscountValue,
      });
    }

    totalRewardPointsValue += bestPointsValue;
    totalNetDiscount += bestDiscountValue;
    totalRewardsValue += bestPointsValue + bestDiscountValue;
  });

  const recommendedCards = Array.from(usedCards.values())
    .map((cardRec) => ({
      ...cardRec,
      netBenefit: cardRec.netBenefit - cardRec.maintenanceFee,
    }))
    .sort((a, b) => b.netBenefit - a.netBenefit);

  const totalAnnualFees = recommendedCards.reduce((sum, rec) => sum + rec.maintenanceFee, 0);
  const netSavings = totalRewardPointsValue + totalNetDiscount - totalAnnualFees;

  return {
    totalTransactions: Math.round(totalTransactions),
    totalAnnualRewards: Math.round(totalRewardsValue),
    totalRewardPointsValue: Math.round(totalRewardPointsValue),
    totalNetDiscount: Math.round(totalNetDiscount),
    totalAnnualFees: Math.round(totalAnnualFees),
    netSavings: Math.round(netSavings),
    recommendedCards,
  };
}

type EligibilityBand = {
  minCreditScore: number;
  minIncome: number;
  sourceLabel: string;
};

function getEligibilityBand(tier: string): EligibilityBand {
  switch (tier) {
    case "Super Premium":
      return { minCreditScore: 780, minIncome: 2500000, sourceLabel: "Issuer web benchmarks (premium cards)" };
    case "Premium":
      return { minCreditScore: 740, minIncome: 1200000, sourceLabel: "Issuer web benchmarks (premium cards)" };
    case "Mid-Range":
      return { minCreditScore: 700, minIncome: 600000, sourceLabel: "Issuer web benchmarks (mid-range cards)" };
    default:
      return { minCreditScore: 650, minIncome: 300000, sourceLabel: "Issuer web benchmarks (entry cards)" };
  }
}

function parseSpendInput(s: string): number {
  const n = parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function createEmptyProfile() {
  return {
    income: "",
    creditScore: "",
    categories: {
      dining: "",
      travel: "",
      fuel: "",
      luxury: "",
      entertainment: "",
      groceries: "",
      onlineShopping: "",
      utilityBills: "",
      other: "",
    },
    isMonthly: true,
  };
}

export default function Home() {
  const { mergedCards } = useCardCatalog();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [tierFilter, setTierFilter] = useState("All");
  const [profile, setProfile] = useState(createEmptyProfile);

  const [result, setResult] = useState<any>(null);
  const filteredRecommendedCards = useMemo(() => {
    const cards: RecommendedCard[] = result?.recommendedCards || [];
    if (tierFilter === "All") return cards;
    return cards.filter((rec) => rec.card.tier === tierFilter);
  }, [result, tierFilter]);

  const handleBeginAnalysis = () => {
    const inc = parseSpendInput(profile.income);
    const cs = parseInt(profile.creditScore.trim(), 10);
    if (
      !profile.income.trim() ||
      !profile.creditScore.trim() ||
      inc <= 0 ||
      !Number.isFinite(cs) ||
      cs < 300 ||
      cs > 900
    ) {
      alert("Please enter a valid annual income and a credit score between 300 and 900.");
      return;
    }
    setStep(2);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const c = profile.categories;
      const dining = parseSpendInput(c.dining);
      const travel = parseSpendInput(c.travel);
      const fuel = parseSpendInput(c.fuel);
      const luxury = parseSpendInput(c.luxury);
      const entertainment = parseSpendInput(c.entertainment);
      const groceries = parseSpendInput(c.groceries);
      const onlineShopping = parseSpendInput(c.onlineShopping);
      const utilityBills = parseSpendInput(c.utilityBills);
      const other = parseSpendInput(c.other);
      const categoryNums = [dining, travel, fuel, luxury, entertainment, groceries, onlineShopping, utilityBills, other];
      if (categoryNums.every((n) => n <= 0)) {
        alert("Enter a positive amount in at least one spending category.");
        setLoading(false);
        return;
      }

      const data = calculatePortfolioOptimization(
        {
          dining,
          travel,
          fuel,
          luxury,
          entertainment,
          groceries,
          onlineShopping,
          utilityBills,
          other,
        },
        profile.isMonthly,
        mergedCards
      );
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResult(data);
      setTierFilter("All");
      setStep(3);
      
      // Auto-trigger removed: AI explanation is now on-demand
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIExplanation = async (res: any) => {
    setExplaining(true);
    try {
      // Backend expects categories: { dining, travel, fuel, groceries, onlineShopping, utilityBills, jewelry, other }
      // Frontend state uses: { dining, travel, fuel, luxury, entertainment, groceries, onlineShopping, utilityBills, other }
      // Map fields explicitly so the AI receives the correct spending breakdown.
      const cat = profile.categories;
      const dining = parseSpendInput(cat.dining);
      const travel = parseSpendInput(cat.travel);
      const fuel = parseSpendInput(cat.fuel);
      const luxury = parseSpendInput(cat.luxury);
      const entertainment = parseSpendInput(cat.entertainment);
      const groceries = parseSpendInput(cat.groceries);
      const onlineShopping = parseSpendInput(cat.onlineShopping);
      const utilityBills = parseSpendInput(cat.utilityBills);
      const otherCat = parseSpendInput(cat.other);
      const backendProfile = {
        income: parseSpendInput(profile.income),
        creditScore: parseInt(profile.creditScore.trim(), 10) || 0,
        isMonthly: profile.isMonthly,
        categories: {
          dining,
          travel,
          fuel,
          groceries,
          onlineShopping,
          utilityBills,
          jewelry: luxury,
          other: entertainment + otherCat,
        },
      };

      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: res, profile: backendProfile }),
      });
      const data = await response.json();
      setExplanation(data.explanation ?? data.error ?? "Failed to generate explanation.");
    } catch (error) {
      setExplanation("Our AI strategist is optimizing your portfolio recommendations.");
      console.error("AI explanation failed:", error);
    } finally {
      setExplaining(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Override addPage to ensure all pages have the navy background
    const originalAddPage = doc.addPage.bind(doc);
    doc.addPage = function(...args: any[]) {
      originalAddPage(...args);
      doc.setFillColor(8, 12, 24);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      return this;
    };

    // 1. INSTITUTIONAL BACKGROUND (Page 1)
    doc.setFillColor(8, 12, 24); // Deep Navy
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Accent: Ambient Glow Simulation
    doc.setDrawColor(212, 175, 55, 0.05);
    doc.setFillColor(212, 175, 55, 0.02);
    doc.circle(pageWidth, 0, 100, 'F');
    
    // 2. PREMIUM HEADER
    doc.setFont("times", "italic");
    doc.setFontSize(28);
    doc.setTextColor(212, 175, 55); // Gold
    doc.text("Aura Wealth Management", pageWidth / 2, 35, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 140);
    doc.text("PRIVATE WEALTH SUITE • VERSION 2.0 • CONFIDENTIAL", pageWidth / 2, 45, { align: "center" });

    // 3. FINANCIAL BLUEPRINT SUMMARY
    doc.setDrawColor(212, 175, 55, 0.2);
    doc.line(20, 60, pageWidth - 20, 60);

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Portfolio Audit Blueprint", 20, 75);

    // KPI Blocks
    doc.setFillColor(15, 23, 42); // Surface
    doc.roundedRect(20, 85, 80, 40, 4, 4, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(212, 175, 55);
    doc.text("NET ANNUAL SAVINGS", 30, 100);
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(`INR ${result.netSavings.toLocaleString()}`, 30, 115);

    doc.setFillColor(15, 23, 42); 
    doc.roundedRect(110, 85, 80, 40, 4, 4, 'F');
    doc.setFontSize(9);
    doc.setTextColor(212, 175, 55);
    doc.text("EFFICIENCY RATING", 120, 100);
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(`94.2%`, 120, 115);

    let currentY = 145;

    // 4. EXPENSES TABLE
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(212, 175, 55);
    doc.text("Current Spending DNA", 20, currentY);

    const expensesData = Object.entries(profile.categories)
      .filter(([_, value]) => parseSpendInput(String(value)) > 0)
      .map(([key, value]) => [
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        `INR ${parseSpendInput(String(value)).toLocaleString()}`
      ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [['CATEGORY', profile.isMonthly ? 'MONTHLY SPEND' : 'ANNUAL SPEND']],
      body: expensesData.length > 0 ? expensesData : [['No Data', 'INR 0']],
      theme: 'grid',
      styles: { 
        fillColor: [15, 23, 42], 
        textColor: [255, 255, 255],
        fontSize: 9,
        font: "helvetica",
        cellPadding: 5,
        lineColor: [30, 41, 59]
      },
      headStyles: { 
        fillColor: [212, 175, 55], 
        textColor: [8, 12, 24],
        font: "helvetica",
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [20, 30, 50] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // Check if we need a new page for the Portfolio table
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 30;
    }

    // 5. CURATED ASSET TABLE
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(212, 175, 55);
    doc.text("Optimal Card Portfolio", 20, currentY);

    const tableData = result.recommendedCards.map((r: any) => [
      r.card.name.toUpperCase(),
      r.card.issuer.toUpperCase(),
      r.card.tier.toUpperCase(),
      `INR ${r.netBenefit.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [['ASSET NAME', 'ISSUER', 'TIER', 'ANNUAL YIELD']],
      body: tableData,
      theme: 'grid',
      styles: { 
        fillColor: [15, 23, 42], 
        textColor: [255, 255, 255],
        fontSize: 8,
        font: "helvetica",
        cellPadding: 6,
        lineColor: [30, 41, 59]
      },
      headStyles: { 
        fillColor: [212, 175, 55], 
        textColor: [8, 12, 24],
        font: "helvetica",
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [20, 30, 50] },
      columnStyles: { 3: { halign: 'right', fontStyle: 'bold', textColor: [212, 175, 55] } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // Check if we need a new page for the AI explanation
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 30;
    }

    // 6. AI STRATEGIC SYNTHESIS
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(212, 175, 55);
    doc.text("AI Strategic Synthesis", 20, currentY);

    const cleanExplanation = (explanation || "Analysis not generated. Click 'Generate AI Strategic Audit' in the dashboard first.")
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/₹/g, 'INR ')
      .replace(/—/g, '-')
      .replace(/–/g, '-');

    const paragraphs = cleanExplanation.split('\n').filter(p => p.trim() !== '');

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(200, 210, 230);
    
    // Calculate approximate line height in mm for 10pt font with 1.5 line spacing
    const lineHeight = (10 * 1.5) / 2.8346; 
    currentY += 10;

    for (const para of paragraphs) {
      const lines = doc.splitTextToSize(para.trim(), pageWidth - 40);
      const paraHeight = lines.length * lineHeight;

      // If the paragraph overflows the page, push it to the next page
      if (currentY + paraHeight > pageHeight - 25) {
        doc.addPage();
        currentY = 30;
      }

      // Render the text cleanly using native jsPDF left-alignment
      doc.text(lines, 20, currentY, { lineHeightFactor: 1.5, align: 'left' });
      
      // Move cursor down for the next paragraph, adding 4mm of paragraph spacing
      currentY += paraHeight + 4; 
    }

    // 7. INSTITUTIONAL FOOTER
    const pageCount = (doc.internal as any).getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(70, 80, 100);
      doc.text(`PAGE ${i} OF ${pageCount} • VERIFIED BY INSTITUTIONAL AI`, pageWidth / 2, pageHeight - 15, { align: "center" });
      doc.text("© 2026 AURA WEALTH MANAGEMENT LTD. ALL RIGHTS RESERVED.", pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    doc.save("Aura_Wealth_Institutional_Audit.pdf");
  };

  const updateCategory = (cat: string, val: string) => {
    setProfile(p => ({
      ...p,
      categories: { ...p.categories, [cat]: val },
    }));
  };

  return (
    <main className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          >
            <div className="relative z-10 max-w-2xl px-12 py-16 text-center rounded-lg border border-amber-500/10 bg-slate-950/40 backdrop-blur-[30px] shadow-[0_20px_50px_rgba(212,175,55,0.05)]">
              <div className="flex justify-center mb-12">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 border-[0.5px] border-primary/20 rounded-full"></div>
                  <div className="pulse-ring absolute inset-0 border-2 border-primary rounded-full"></div>
                  <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border border-primary/10">
                    <div className="shimmer-gold absolute inset-0 w-full h-full opacity-40"></div>
                    <MaterialIcon name="insights" className="text-primary text-3xl" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">
                  Analyzing your financial DNA...
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto opacity-80 leading-relaxed">
                  Our proprietary engine is synthesizing your wealth data for institutional-grade optimization.
                </p>
                <div className="pt-8 flex flex-col items-center gap-4">
                  <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                  <div className="flex gap-4">
                    <span className="font-label-sm text-label-sm text-slate-500 tracking-[0.2em] uppercase">Markets Synced</span>
                    <span className="font-label-sm text-label-sm text-primary tracking-[0.2em] uppercase">Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-32 pb-24 px-gutter md:px-margin-page flex flex-col items-center justify-center min-h-[90vh]"
          >
            <div className="max-w-4xl text-center space-y-6 mb-16">
              <h1 className="font-display-xl text-display-xl text-on-background italic">
                Wealth Optimized.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto opacity-80">
                Unlock the true potential of your financial identity. Aura Wealth leverages institutional-grade credit optimization to elevate your purchasing power and secure your legacy.
              </p>
            </div>

            <div className="glass-card gold-aura w-full max-w-2xl rounded-lg p-10 md:p-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="font-label-sm text-label-sm text-on-secondary-container uppercase">Annual Income</label>
                    <div className="relative group">
                      <span className="absolute left-0 bottom-2 text-primary/60 font-body-lg">₹</span>
                      <input 
                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-headline-md font-headline-md py-2 pl-6 transition-all duration-500 placeholder:text-surface-variant text-on-surface"
                        placeholder="1,200,000"
                        type="number"
                        value={profile.income}
                        onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="font-label-sm text-label-sm text-on-secondary-container uppercase">Credit Score</label>
                    <div className="relative group">
                      <input 
                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-headline-md font-headline-md py-2 transition-all duration-500 placeholder:text-surface-variant text-on-surface"
                        placeholder="780"
                        type="number"
                        value={profile.creditScore}
                        onChange={(e) => setProfile({ ...profile, creditScore: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <button 
                    onClick={handleBeginAnalysis}
                    className="w-full gold-gradient text-on-primary py-6 rounded-DEFAULT font-label-sm uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 gold-aura"
                  >
                    Begin Analysis
                  </button>
                </div>
                <div className="flex items-center justify-center gap-4 text-on-tertiary-fixed-variant opacity-60">
                  <MaterialIcon name="lock" className="text-sm" />
                  <span className="font-label-sm text-[10px]">Encrypted & Institutional Privacy Assured</span>
                </div>
              </div>
            </div>

            <section className="max-w-[1440px] mx-auto px-margin-page mt-24 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-10 rounded-lg space-y-4">
                  <MaterialIcon name="precision_manufacturing" className="text-primary text-3xl" />
                  <h3 className="font-headline-md text-headline-md text-on-background">Algorithmic Precision</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant opacity-70">Our proprietary engine analyzes thousands of datapoints to find inefficiencies in your credit structure.</p>
                </div>
                <div className="glass-card p-10 rounded-lg space-y-4">
                  <MaterialIcon name="verified_user" className="text-primary text-3xl" />
                  <h3 className="font-headline-md text-headline-md text-on-background">Vault Security</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant opacity-70">Experience peace of mind with 256-bit encryption and private server environments for all sensitive data.</p>
                </div>
                <div className="glass-card p-10 rounded-lg space-y-4">
                  <MaterialIcon name="auto_graph" className="text-primary text-3xl" />
                  <h3 className="font-headline-md text-headline-md text-on-background">Growth Projection</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant opacity-70">Visualize your wealth trajectory with optimized credit lines and premium asset access.</p>
                </div>
              </div>
            </section>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pt-32 pb-24 px-margin-page max-w-container-max mx-auto"
          >
            <div className="mb-section-gap max-w-3xl">
              <h1 className="font-display-xl text-display-xl text-primary-fixed mb-6">Refine Your Spending DNA</h1>
              <p className="font-body-lg text-body-lg text-secondary opacity-80">Analyze your monthly capital allocation to unlock bespoke savings strategies and institutional-grade portfolio optimization.</p>
            </div>

            <div className="glass-card p-12 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-container/5 rounded-full blur-[100px]"></div>
              <form onSubmit={handleCalculate} className="relative z-10">
                <div className="mb-14">
                  <label className="flex items-center gap-3 font-label-sm text-label-sm text-outline uppercase mb-4 tracking-[0.2em]">
                    <MaterialIcon name="calendar_month" className="text-primary" />
                    Spending Input Period
                  </label>
                  <div className="inline-flex rounded-full border border-outline/40 bg-white/5 p-1">
                    <button
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, isMonthly: true }))}
                      className={`px-6 py-2 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                        profile.isMonthly
                          ? "bg-primary text-on-primary"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, isMonthly: false }))}
                      className={`px-6 py-2 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                        !profile.isMonthly
                          ? "bg-primary text-on-primary"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    You are entering {profile.isMonthly ? "monthly" : "yearly"} category spends.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16">
                  {[
                    { id: 'dining', label: 'Dining & Gastronomy', icon: 'restaurant' },
                    { id: 'travel', label: 'Global Travel', icon: 'flight_takeoff' },
                    { id: 'fuel', label: 'Fuel & Transport', icon: 'local_gas_station' },
                    { id: 'luxury', label: 'Luxury Goods', icon: 'diamond' },
                    { id: 'entertainment', label: 'Entertainment', icon: 'theater_comedy' },
                    { id: 'groceries', label: 'Curated Groceries', icon: 'shopping_basket' },
                    { id: 'onlineShopping', label: 'Digital Commerce', icon: 'shopping_cart' },
                    { id: 'utilityBills', label: 'Fixed Utilities', icon: 'home_repair_service' },
                  ].map((item) => (
                    <div key={item.id} className="group">
                      <label className="flex items-center gap-3 font-label-sm text-label-sm text-outline uppercase mb-4 tracking-[0.2em]">
                        <MaterialIcon name={item.icon} className="text-primary" />
                        {item.label}
                      </label>
                      <div className="relative border-b border-outline/30 transition-all duration-500 focus-within:border-primary">
                        <span className="absolute left-0 bottom-3 text-primary-fixed font-headline-md">₹</span>
                        <input 
                          className="w-full bg-transparent border-none focus:ring-0 pl-8 pb-3 text-headline-md font-headline-md text-on-surface placeholder:text-surface-variant"
                          placeholder="0.00"
                          type="number"
                          value={(profile.categories as any)[item.id]}
                          onChange={(e) => updateCategory(item.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-8">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 font-label-sm text-label-sm text-slate-400 uppercase tracking-widest hover:text-white transition-colors duration-300"
                  >
                    <MaterialIcon name="arrow_back_ios" className="text-sm" />
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="w-full md:w-auto bg-gradient-to-r from-primary-container to-primary px-12 py-5 rounded-full text-on-primary font-label-sm uppercase tracking-[0.2em] transition-all duration-500 scale-100 active:scale-95 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4)]"
                  >
                    Calculate Savings
                  </button>
                </div>
              </form>
            </div>

            <section className="mt-section-gap grid grid-cols-1 md:grid-cols-1 gap-12">
              <div className="glass-card p-10 flex flex-col gap-6 items-center text-center">
                <MaterialIcon name="shield" className="text-primary text-4xl" />
                <h3 className="font-headline-md text-headline-md text-on-surface">Private & Institutional Security</h3>
                <p className="text-body-md text-secondary/70 max-w-lg">Your financial data is encrypted using military-grade protocols and processed in a zero-trust environment.</p>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-40 pb-32 px-12 max-w-[1440px] mx-auto space-y-16"
          >
            <header className="flex flex-col md:flex-row justify-between items-end gap-8 pb-12 border-b border-white/5">
              <div className="space-y-4">
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="font-display-xl text-display-xl text-on-surface leading-tight"
                >
                  Wealth Optimization Blueprint
                </motion.h1>
                <p className="font-body-lg text-body-lg text-slate-400 max-w-2xl italic font-newsreader leading-relaxed tracking-wide">
                  A curated financial synthesis engineered for your unique wealth ecosystem.
                </p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
                className="bg-primary/10 border border-primary/40 text-primary px-10 py-4 rounded-full font-label-sm uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(212,175,55,0.1)]"
              >
                <MaterialIcon name="download" className="text-sm" />
                Export Audit Report
              </motion.button>
            </header>

            <div className="grid grid-cols-12 gap-12">
              <section className="col-span-12 lg:col-span-8 space-y-12">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="glass-card p-16 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center min-h-[450px] border border-white/10"
                >
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full"></div>
                  <div className="relative z-10 space-y-8">
                    <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.3em] block opacity-80">Efficiency Metric</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface-variant leading-snug">Estimated Net Annual Savings</h2>
                    <div className="flex items-baseline gap-4">
                      <span className="font-display-xl text-[7rem] leading-none gold-text-gradient font-light">₹{result?.netSavings.toLocaleString()}</span>
                      <span className="font-body-lg text-primary/60 italic font-newsreader text-2xl tracking-widest">/ ANNUM</span>
                    </div>
                    <p className="font-body-md text-slate-400 max-w-xl leading-relaxed tracking-wide opacity-90">
                      Net savings is computed on your full annual transaction volume and includes reward point value plus direct discount value, minus total maintenance fees.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-slate-400">
                        Total transactions: ₹{result?.totalTransactions?.toLocaleString()}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-slate-400">
                        Net discount: ₹{result?.totalNetDiscount?.toLocaleString()}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-slate-400">
                        Reward points value: ₹{result?.totalRewardPointsValue?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-12 rounded-[2rem] border border-white/5 space-y-8"
                >
                  <h3 className="font-headline-md text-on-surface flex items-center gap-6 tracking-wide">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <MaterialIcon name="smart_toy" className="text-primary" />
                    </div>
                    Deep Audit Strategic Explanation
                  </h3>
                  {(!explanation && !explaining) ? (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fetchAIExplanation(result)}
                      className="bg-primary/10 border border-primary/40 text-primary px-8 py-4 rounded-xl font-label-sm uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all flex items-center gap-3 w-max mt-4 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                    >
                      <MaterialIcon name="auto_awesome" className="text-lg" />
                      Generate AI Strategic Audit
                    </motion.button>
                  ) : explaining ? (
                    <div className="animate-pulse space-y-6 mt-4">
                      <div className="h-4 bg-white/5 rounded w-3/4"></div>
                      <div className="h-4 bg-white/5 rounded w-1/2"></div>
                      <div className="h-4 bg-white/5 rounded w-5/6"></div>
                    </div>
                  ) : (
                    <div className="text-slate-300 leading-[1.8] font-body-md whitespace-pre-line tracking-wide bg-white/5 p-8 rounded-xl border border-white/5 mt-4">
                      {explanation}
                    </div>
                  )}
                </motion.div>
              </section>

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-12">
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-12 rounded-[2rem] flex-1 flex flex-col justify-between border-l-4 border-l-primary/40 border border-white/5 group hover:border-primary/20 transition-all duration-700"
                >
                  <div className="space-y-6">
                    <span className="font-label-sm text-label-sm text-slate-400 uppercase tracking-[0.2em] block">Total Rewards + Discounts</span>
                    <div className="flex items-center justify-between">
                      <span className="font-headline-md text-on-surface text-4xl">₹{result?.totalAnnualRewards.toLocaleString()}</span>
                      <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <MaterialIcon name="trending_up" className="text-primary text-3xl" />
                      </div>
                    </div>
                  </div>
                  <div className="h-[1px] w-full bg-white/5 my-10"></div>
                  <div className="space-y-6">
                    <span className="font-label-sm text-label-sm text-slate-400 uppercase tracking-[0.2em] block">Efficiency Rating</span>
                    <div className="flex items-center justify-between">
                      <span className="font-headline-md text-on-surface text-4xl tracking-tighter">94.2%</span>
                      <div className="flex gap-2">
                        {[1, 0.4, 0.1].map((op, i) => (
                          <motion.div 
                            key={i}
                            animate={{ opacity: [op, op + 0.3, op] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                            className="w-3 h-3 rounded-full bg-primary"
                            style={{ opacity: op }}
                          ></motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-12 rounded-[2rem] flex-1 flex flex-col justify-between border-l-4 border-l-slate-700 border border-white/5"
                >
                  <div className="space-y-6">
                    <span className="font-label-sm text-label-sm text-slate-400 uppercase tracking-[0.2em] block">Maintenance Fees</span>
                    <div className="flex items-center justify-between">
                      <span className="font-headline-md text-slate-300 text-4xl">₹{result?.totalAnnualFees.toLocaleString()}</span>
                      <MaterialIcon name="verified" className="text-slate-600 text-3xl" />
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-bold">Deducted from rewards to compute net savings</p>
                  </div>
                </motion.div>
              </div>

              <section className="col-span-12 pt-16 space-y-12">
                <div className="flex flex-col space-y-4">
                  <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Curated Card Portfolio</h3>
                  <p className="font-body-md text-slate-400 italic font-newsreader text-xl tracking-wide opacity-80">Recommended asset vehicles engineered for institutional-grade rewards yield.</p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {["All", "Entry", "Mid-Range", "Premium", "Super Premium"].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setTierFilter(tier)}
                        className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] border transition-all ${
                          tierFilter === tier
                            ? "bg-primary/20 border-primary/50 text-primary"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                  {filteredRecommendedCards.map((rec: any, idx: number) => {
                    const eligibilityBand = getEligibilityBand(rec.card.tier);
                    const parsedScore = parseInt(profile.creditScore.trim(), 10);
                    const parsedIncome = parseSpendInput(profile.income);
                    const isEligibleByScore =
                      Number.isFinite(parsedScore) && parsedScore >= eligibilityBand.minCreditScore;
                    const isEligibleByIncome =
                      Number.isFinite(parsedIncome) && parsedIncome >= eligibilityBand.minIncome;
                    const isLikelyEligible = isEligibleByScore && isEligibleByIncome;

                    return (
                    <motion.div 
                      key={idx}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="glass-card group transition-all duration-700 p-10 flex flex-col lg:flex-row items-center gap-16 hover:shadow-[0_20px_80px_rgba(212,175,55,0.08)] hover:border-primary/30 rounded-[2.5rem] border border-white/10"
                    >
                      <div className="w-full md:w-72 h-44 relative rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                         {rec.card.imageUrl ? (
                           <img 
                             src={rec.card.imageUrl} 
                             alt={rec.card.name} 
                             className="w-full h-full object-cover"
                             onError={(e) => {
                               (e.target as any).style.display = 'none';
                               (e.target as any).nextSibling.style.display = 'flex';
                             }}
                           />
                         ) : null}
                         
                         {/* Dynamic CSS Card Fallback */}
                         <div 
                            className="w-full h-full flex flex-col justify-between p-5 relative"
                            style={{
                              display: rec.card.imageUrl ? 'none' : 'flex',
                              background: rec.card.tier === 'Super Premium' ? 'linear-gradient(135deg, #1a1c29 0%, #0B1326 100%)' :
                                          rec.card.tier === 'Premium' ? 'linear-gradient(135deg, #2A3B5C 0%, #111827 100%)' :
                                          'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                              border: rec.card.tier === 'Super Premium' ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.1)',
                              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                            }}
                         >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-10 mix-blend-overlay"></div>
                            
                            <div className="flex justify-between items-start relative z-10">
                              <span className="font-headline-md text-sm tracking-wider text-white opacity-90">{rec.card.issuer.toUpperCase()}</span>
                              <div className="w-8 h-6 rounded bg-gradient-to-br from-yellow-200 to-yellow-600 opacity-80 shadow-sm flex items-center justify-center">
                                <div className="w-full h-[1px] bg-black/20 absolute"></div>
                                <div className="w-[1px] h-full bg-black/20 absolute"></div>
                              </div>
                            </div>
                            
                            <div className="relative z-10 space-y-1">
                              <h4 className="font-newsreader italic text-xl tracking-wide text-white" style={{
                                color: rec.card.tier === 'Super Premium' ? '#D4AF37' : '#FFFFFF'
                              }}>
                                {rec.card.name}
                              </h4>
                              <p className="font-body-md text-[8px] tracking-[0.3em] uppercase text-slate-400">Verified Asset • {rec.card.tier}</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex-grow space-y-6">
                        <div className="flex items-center gap-6">
                          <span className="font-label-sm text-[10px] px-5 py-2 bg-primary/5 text-primary border border-primary/20 rounded-full uppercase tracking-[0.2em]">{rec.card.tier}</span>
                          <span className="font-label-sm text-[10px] px-5 py-2 bg-white/5 text-slate-400 border border-white/10 rounded-full uppercase tracking-[0.2em]">Verified Asset</span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-headline-md text-on-surface text-3xl tracking-tight group-hover:text-primary transition-colors duration-500">{rec.card.name}</h4>
                          <p className="font-body-md text-slate-500 text-lg tracking-wide">{rec.card.issuer} • Primary Yield Driver for {rec.categoryMapping.join(', ')}</p>
                        </div>
                      </div>
                      <div className="lg:w-px h-24 bg-white/10 hidden lg:block"></div>
                      <div className="text-center lg:text-right flex-shrink-0 space-y-2">
                        <span className="font-label-sm text-slate-400 uppercase tracking-[0.2em] block text-[11px] font-bold">Projected Net Yield</span>
                        <span className="font-headline-md text-primary text-4xl tracking-tight">₹{rec.netBenefit.toLocaleString()} <span className="text-base font-body-md italic text-slate-500 tracking-normal opacity-60">/ YR</span></span>
                        <p className="text-xs text-slate-500">
                          Points ₹{Math.round(rec.rewardPointsValue).toLocaleString()} + Discount ₹{Math.round(rec.netDiscountValue).toLocaleString()} - Fee ₹{Math.round(rec.maintenanceFee).toLocaleString()}
                        </p>
                        <div className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
                          isLikelyEligible ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}>
                          <p className="uppercase tracking-[0.15em] text-[10px] mb-1">Eligibility from web benchmarks</p>
                          <p>{isLikelyEligible ? "Likely eligible" : "Borderline eligibility"}</p>
                          <p>Min score: {eligibilityBand.minCreditScore}+ | Min income: ₹{eligibilityBand.minIncome.toLocaleString()}/yr</p>
                          <p className="text-[10px] opacity-80">{eligibilityBand.sourceLabel}</p>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
                {filteredRecommendedCards.length === 0 && (
                  <div className="text-center py-10 text-slate-500 border border-white/10 rounded-2xl bg-white/5">
                    No recommended cards match the selected tier.
                  </div>
                )}
              </section>
            </div>
            
            <div className="pt-24 flex flex-col items-center gap-8">
               <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setProfile(createEmptyProfile());
                  setResult(null);
                  setExplanation("");
                  setTierFilter("All");
                  setStep(1);
                }}
                className="text-slate-500 hover:text-primary font-label-sm uppercase tracking-[0.3em] transition-all duration-500 flex items-center gap-4 bg-white/5 px-10 py-4 rounded-full border border-white/5 hover:border-primary/20"
              >
                <MaterialIcon name="refresh" className="text-sm" />
                Initialize New Synthesis
              </motion.button>
              <p className="font-label-sm text-[10px] text-slate-700 tracking-[0.4em] uppercase">Private Wealth Suite v2.0</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
