export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  network: "Visa" | "Mastercard" | "Amex" | "RuPay";
  image: string;
  annualFee: number;
  joiningFee: number;
  bestFor: string;
  cardType: string[];
  approvalDifficulty: "easy" | "moderate" | "premium";
  rewardCategories: string[];
  rewardRate: string;
  keyBenefits: string[];
  loungeAccess: boolean;
  fuelSurchargeWaiver: boolean;
  welcomeBonus: string | null;
  popularityScore: number;
  rewardStrengthScore: number;
  beginnerScore: number;
  tags: string[];
  applyUrl: string;
}
