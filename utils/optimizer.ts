export type Category =
  | "dining"
  | "travel"
  | "fuel"
  | "groceries"
  | "onlineShopping"
  | "utilityBills"
  | "jewelry"
  | "other";

export type SpendingProfile = {
  income: number;
  creditScore: number;
  categories: Record<Category, number>;
  isMonthly: boolean;
};

export type Card = {
  id: string;
  name: string;
  issuer: string;
  tier: string;
  annualFee: number;
  rewards: Partial<Record<Category, number>>;
  specialBenefits: string[];
  milestones?: { spend: number; benefit: string }[];
};

export type CardRecommendation = {
  card: Card;
  categoryMapping: Category[];
  netBenefit: number;
};

export type OptimizationResult = {
  totalAnnualRewards: number;
  totalAnnualFees: number;
  netSavings: number;
  recommendedCards: CardRecommendation[];
};

export const CARDS: Card[] = [
    {
        id: "hdfc-infinia", name: "Infinia Metal Edition", issuer: "HDFC", tier: "Super Premium", annualFee: 12500,
        rewards: { travel: 0.33, dining: 0.15, onlineShopping: 0.033, groceries: 0.033, other: 0.033 },
        specialBenefits: ["Unlimited Lounge", "1:1 Rewards Transfer", "ITC Hotel Benefits"],
        milestones: [{ spend: 1000000, benefit: "Annual Fee Waiver" }]
    },
    {
        id: "axis-magnus", name: "Magnus", issuer: "Axis", tier: "Super Premium", annualFee: 12500,
        rewards: { travel: 0.12, dining: 0.06, onlineShopping: 0.02, other: 0.012 },
        specialBenefits: ["25k Edge Points Monthly", "Meet & Greet Service"],
        milestones: [{ spend: 150000, benefit: "25,000 Points (Monthly)" }]
    },
    {
        id: "sbi-aurum", name: "AURUM", issuer: "SBI", tier: "Super Premium", annualFee: 10000,
        rewards: { dining: 0.04, travel: 0.04, onlineShopping: 0.04, other: 0.01 },
        specialBenefits: ["Metal Card", "Club Marriott Membership"],
        milestones: [{ spend: 1200000, benefit: "Annual Fee Waiver" }]
    },
    {
        id: "amex-platinum", name: "The Platinum Card", issuer: "Amex", tier: "Super Premium", annualFee: 60000,
        rewards: { travel: 0.05, dining: 0.03, other: 0.025 },
        specialBenefits: ["Global Lounge Access", "Fine Hotels + Resorts", "Concierge"],
        milestones: []
    },
    {
        id: "icici-emeralde", name: "Emeralde Private Metal", issuer: "ICICI", tier: "Super Premium", annualFee: 12000,
        rewards: { travel: 0.03, dining: 0.03, other: 0.03 },
        specialBenefits: ["Unlimited International Lounge", "Golf Access"],
        milestones: []
    },
    {
        id: "sc-ultimate", name: "Ultimate", issuer: "Standard Chartered", tier: "Super Premium", annualFee: 5000,
        rewards: { dining: 0.033, travel: 0.033, other: 0.033 },
        specialBenefits: ["Premium Rewards Redemption"],
        milestones: []
    },
    {
        id: "yes-marquee", name: "Marquee", issuer: "Yes Bank", tier: "Super Premium", annualFee: 10000,
        rewards: { onlineShopping: 0.045, dining: 0.045, other: 0.0225 },
        specialBenefits: ["Unlimited Lounge", "Low Forex (1%)"],
        milestones: []
    },
    {
        id: "hdfc-regalia-gold", name: "Regalia Gold", issuer: "HDFC", tier: "Premium", annualFee: 2500,
        rewards: { travel: 0.05, onlineShopping: 0.05, other: 0.013 },
        specialBenefits: ["Lounge Access", "M&S/Myntra Vouchers"],
        milestones: [{ spend: 400000, benefit: "₹5,000 Voucher" }]
    },
    {
        id: "axis-atlas", name: "Atlas", issuer: "Axis", tier: "Premium", annualFee: 5000,
        rewards: { travel: 0.10, dining: 0.04, other: 0.02 },
        specialBenefits: ["Edge Miles", "Tiered Milestone Rewards"],
        milestones: [{ spend: 300000, benefit: "2,500 Miles" }]
    },
    {
        id: "amex-plat-travel", name: "Platinum Travel", issuer: "Amex", tier: "Premium", annualFee: 5000,
        rewards: { travel: 0.08, onlineShopping: 0.02, other: 0.02 },
        specialBenefits: ["Milestone Vouchers", "Taj Vouchers"],
        milestones: [{ spend: 400000, benefit: "40k Points + Taj Voucher" }]
    },
    {
        id: "sbi-elite", name: "ELITE", issuer: "SBI", tier: "Premium", annualFee: 4999,
        rewards: { dining: 0.025, groceries: 0.025, other: 0.005 },
        specialBenefits: ["Free Movie Tickets", "Lounge Access"],
        milestones: [{ spend: 300000, benefit: "Annual Fee Waiver" }]
    },
    {
        id: "amazon-pay-icici", name: "Amazon Pay ICICI", issuer: "ICICI", tier: "Entry-Level", annualFee: 0,
        rewards: { onlineShopping: 0.05, groceries: 0.02, other: 0.01 },
        specialBenefits: ["Lifetime Free", "Unlimited 5% for Prime"],
        milestones: []
    },
    {
        id: "sbi-cashback", name: "Cashback SBI Card", issuer: "SBI", tier: "Mid-Range", annualFee: 999,
        rewards: { onlineShopping: 0.05, other: 0.01 },
        specialBenefits: ["Direct Statement Cashback"],
        milestones: [{ spend: 200000, benefit: "Annual Fee Waiver" }]
    },
    {
        id: "axis-ace", name: "ACE", issuer: "Axis", tier: "Mid-Range", annualFee: 499,
        rewards: { utilityBills: 0.05, dining: 0.04, other: 0.02 },
        specialBenefits: ["Google Pay Integration"],
        milestones: [{ spend: 200000, benefit: "Annual Fee Waiver" }]
    },
    {
        id: "hdfc-millennia", name: "Millennia", issuer: "HDFC", tier: "Mid-Range", annualFee: 1000,
        rewards: { onlineShopping: 0.05, dining: 0.01, other: 0.01 },
        specialBenefits: ["Cashback as CashPoints", "Lounge Access"],
        milestones: [{ spend: 100000, benefit: "Annual Fee Waiver" }]
    },
    {
        id: "idfc-first-millennia", name: "FIRST Millennia", issuer: "IDFC", tier: "Entry-Level", annualFee: 0,
        rewards: { onlineShopping: 0.015, other: 0.0075 },
        specialBenefits: ["Lifetime Free", "Railway Lounge"],
        milestones: []
    },
    {
        id: "onecard", name: "OneCard", issuer: "Various", tier: "Entry-Level", annualFee: 0,
        rewards: { other: 0.01 },
        specialBenefits: ["Metal Card", "App Controls"],
        milestones: []
    },
    {
        id: "axis-flipkart", name: "Flipkart Axis", issuer: "Axis", tier: "Mid-Range", annualFee: 500,
        rewards: { onlineShopping: 0.05 },
        specialBenefits: ["Unlimited 5% on Flipkart"],
        milestones: []
    },
    {
        id: "hsbc-liveplus", name: "Live+ Card", issuer: "HSBC", tier: "Mid-Range", annualFee: 999,
        rewards: { dining: 0.10, groceries: 0.10 },
        specialBenefits: ["Unlimited 10% on Dining"],
        milestones: []
    }
    // ... Simplified for brevity in fallback, but enough to be useful
];

export function calculateOptimization(
  profile: SpendingProfile,
  mode: "single" | "multi" = "multi"
): OptimizationResult {
  const multiplier = profile.isMonthly ? 12 : 1;
  let totalRewards = 0;
  let usedCards = new Map<string, CardRecommendation>();

  Object.entries(profile.categories).forEach(([category, value]) => {
    const yearlySpend = value * multiplier;
    if (yearlySpend <= 0) return;

    let bestCard: Card | null = null;
    let bestReward = -1;

    CARDS.forEach((card) => {
        // Basic eligibility
        let minIncome = 0;
        if (card.tier === "Super Premium") minIncome = 3000000;
        else if (card.tier === "Premium") minIncome = 1200000;
        else if (card.tier === "Mid-Range") minIncome = 500000;

        if (profile.income < minIncome) return;

        const rewardRate = card.rewards[category as Category] || card.rewards.other || 0;
        const reward = yearlySpend * rewardRate;

        if (reward > bestReward) {
            bestReward = reward;
            bestCard = card;
        }
    });

    if (bestCard) {
      totalRewards += bestReward;
      if (!usedCards.has(bestCard.name)) {
        usedCards.set(bestCard.name, {
          card: bestCard,
          categoryMapping: [category as Category],
          netBenefit: bestReward,
        });
      } else {
        const existing = usedCards.get(bestCard.name)!;
        existing.categoryMapping.push(category as Category);
        existing.netBenefit += bestReward;
      }
    }
  });

  const recommendedCards = Array.from(usedCards.values());
  const totalFees = recommendedCards.reduce((sum, c) => sum + c.card.annualFee, 0);

  return {
    totalAnnualRewards: Math.round(totalRewards),
    totalAnnualFees: totalFees,
    netSavings: Math.round(totalRewards - totalFees),
    recommendedCards,
  };
}
