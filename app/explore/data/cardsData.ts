import { CreditCard } from "./types";
import batch1 from "./batch1";
import batch2 from "./batch2";
import batch3 from "./batch3";
import batch4 from "./batch4";
import batch5 from "./batch5";
import batch6 from "./batch6";

const cardsData: CreditCard[] = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
];

// Re-export type for convenience
export type { CreditCard };
export default cardsData;
