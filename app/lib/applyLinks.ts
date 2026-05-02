import type { CreditCard } from "../explore/data/types";

const ISSUER_APPLY_PAGES: Record<string, string> = {
  "HDFC Bank": "https://www.hdfcbank.com/personal/pay/cards/credit-cards",
  "Axis Bank": "https://www.axisbank.com/retail/cards/credit-card",
  "SBI Card": "https://www.sbicard.com/en/personal/credit-cards.page",
  "ICICI Bank": "https://www.icicibank.com/personal-banking/cards/credit-card",
  "American Express": "https://www.americanexpress.com/in/credit-cards/",
  "IndusInd Bank": "https://www.indusind.com/in/en/personal/cards/credit-cards.html",
  "Kotak Mahindra": "https://www.kotak.com/en/personal-banking/cards/credit-cards.html",
  "AU Small Finance Bank": "https://www.aubank.in/personal-banking/credit-cards",
  "Bank of Baroda": "https://www.bankofbaroda.in/personal-banking/cards/credit-cards",
  "YES Bank": "https://www.yesbank.in/personal-banking/cards/credit-cards",
  "RBL Bank": "https://www.rblbank.com/personal-banking/cards/credit-cards",
  "HSBC India": "https://www.hsbc.co.in/credit-cards/",
  "IDFC FIRST Bank": "https://www.idfcfirstbank.com/credit-card",
  "Federal Bank": "https://www.federalbank.co.in/credit-cards",
  "Canara Bank": "https://canarabank.com/pages/credit-cards",
  "PNB": "https://www.pnbindia.in/credit-card.html",
  "Standard Chartered": "https://www.sc.com/in/credit-cards/",
  "DBS Bank India": "https://www.dbs.com/in/treasures/cards/credit-cards",
  "IDBI Bank": "https://www.idbibank.in/credit-card.asp",
  "Union Bank of India": "https://www.unionbankofindia.co.in/english/credit-card.aspx",
  "Indian Bank": "https://www.indianbank.in/credit-cards/",
  "South Indian Bank": "https://www.southindianbank.com/credit-cards",
  "Saraswat Bank": "https://www.saraswatbank.com/credit-cards",
  "CSB Bank": "https://www.csb.co.in/credit-cards",
  "OneCard": "https://www.getonecard.app/",
  "SBM Bank India": "https://www.sbm.co.in/credit-cards",
  "Slice": "https://www.sliceit.com/",
  "Kiwi": "https://www.kiwi.co.in/",
  "Tata Capital": "https://www.tatacapital.com/credit-cards.html",
};

function issuerHomepage(issuer: string): string {
  // Safe fallback when we don't have an issuer apply page.
  // Prefer official issuer page over any third-party listing.
  const known = ISSUER_APPLY_PAGES[issuer];
  if (known) return known;

  // Last-resort issuer name-based homepage search (non-Google direct link not possible without a mapping).
  // We keep it an official-ish landing (DuckDuckGo) rather than card-matching heuristics.
  return `https://duckduckgo.com/?q=${encodeURIComponent(`${issuer} credit cards official`)}`;
}

export function getApplyUrl(card: CreditCard): string {
  const raw = (card.applyUrl || "").trim();
  if (raw && raw !== "#") return raw;

  return issuerHomepage(card.issuer);
}

