export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
  renewalFeeWaiverThreshold: number | null;
  minIncome: number; // Annual in INR
  minCreditScore: number;
  rewardRates: {
    dining: number; // Percentage
    travel: number;
    fuel: number;
    groceries: number;
    onlineShopping: number;
    utilityBills: number;
    jewelry: number;
    other: number;
  };
  specialBenefits: string[];
  notes: string;
}

export const INDIAN_CREDIT_CARDS: CreditCard[] = [
  {
    id: "hdfc-infinia",
    name: "Infinia Metal Edition",
    issuer: "HDFC Bank",
    annualFee: 12500,
    renewalFeeWaiverThreshold: 1000000,
    minIncome: 4500000,
    minCreditScore: 780,
    rewardRates: {
      dining: 0.15, // Including 5X on SmartBuy dining
      travel: 0.33, // Up to 33% on SmartBuy flights/hotels
      fuel: 0.01,
      groceries: 0.033,
      onlineShopping: 0.033,
      utilityBills: 0.033,
      jewelry: 0.01, // Usually excluded from major rewards or capped
      other: 0.033
    },
    specialBenefits: ["Unlimited Lounge Access", "1:1 Reward Transfer", "Golf Access"],
    notes: "The gold standard for Indian credit cards. Best for high spenders."
  },
  {
    id: "sbi-cashback",
    name: "Cashback SBI Card",
    issuer: "SBI Card",
    annualFee: 999,
    renewalFeeWaiverThreshold: 200000,
    minIncome: 300000,
    minCreditScore: 700,
    rewardRates: {
      dining: 0.05,
      travel: 0.05,
      fuel: 0.0,
      groceries: 0.05,
      onlineShopping: 0.05, // Capped at 5000 per month
      utilityBills: 0.01,
      jewelry: 0.01,
      other: 0.01
    },
    specialBenefits: ["Direct Cashback to Statement"],
    notes: "Best for simple online shopping cashback. Easy to understand."
  },
  {
    id: "axis-atlas",
    name: "Atlas",
    issuer: "Axis Bank",
    annualFee: 5000,
    renewalFeeWaiverThreshold: 1500000,
    minIncome: 900000,
    minCreditScore: 750,
    rewardRates: {
      dining: 0.04,
      travel: 0.10, // High rewards on travel spending
      fuel: 0.01,
      groceries: 0.02,
      onlineShopping: 0.02,
      utilityBills: 0.02,
      jewelry: 0.01,
      other: 0.02
    },
    specialBenefits: ["Edge Miles", "Tiered benefits based on spending"],
    notes: "Excellent for frequent travelers."
  },
  {
    id: "hdfc-swiggy",
    name: "HDFC Swiggy Card",
    issuer: "HDFC Bank",
    annualFee: 500,
    renewalFeeWaiverThreshold: 200000,
    minIncome: 300000,
    minCreditScore: 700,
    rewardRates: {
      dining: 0.10, // On Swiggy
      travel: 0.05, // Online shopping category
      fuel: 0.01,
      groceries: 0.05,
      onlineShopping: 0.05,
      utilityBills: 0.01,
      jewelry: 0.01,
      other: 0.01
    },
    specialBenefits: ["10% on Swiggy", "5% on many online merchants"],
    notes: "Great for foodies and frequent online shoppers."
  },
  {
    id: "axis-ace",
    name: "Ace",
    issuer: "Axis Bank",
    annualFee: 499,
    renewalFeeWaiverThreshold: 200000,
    minIncome: 300000,
    minCreditScore: 720,
    rewardRates: {
      dining: 0.02,
      travel: 0.02,
      fuel: 0.01,
      groceries: 0.02,
      onlineShopping: 0.02,
      utilityBills: 0.05, // Google Pay bills
      jewelry: 0.02,
      other: 0.015
    },
    specialBenefits: ["5% on Utility bills via GPay"],
    notes: "Best for utility bills and offline spending."
  },
  {
    id: "icici-amazon-pay",
    name: "Amazon Pay ICICI Card",
    issuer: "ICICI Bank",
    annualFee: 0,
    renewalFeeWaiverThreshold: null,
    minIncome: 300000,
    minCreditScore: 720,
    rewardRates: {
      dining: 0.01,
      travel: 0.02,
      fuel: 0.01,
      groceries: 0.05, // On Amazon Fresh
      onlineShopping: 0.05, // For Prime members on Amazon
      utilityBills: 0.02,
      jewelry: 0.01,
      other: 0.01
    },
    specialBenefits: ["Lifetime Free", "Unlimited 5% on Amazon"],
    notes: "The best lifetime free card for Amazon loyalists."
  }
];
