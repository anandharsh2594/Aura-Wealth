import cardsData from "../explore/data/cardsData";
import type { CreditCard } from "../explore/data/types";

export type BankSummary = {
  issuer: string;
  slug: string;
  count: number;
  topCardIds: string[];
};

export function slugifyBankName(name: string): string {
  return name
    .toLowerCase()
    .replace(/bank|india|card|cards|limited|ltd\.?/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
}

export function buildIssuerSlugIndex(allCards: CreditCard[]) {
  const issuerToSlug = new Map<string, string>();
  const slugToIssuer = new Map<string, string>();

  allCards.forEach((c) => {
    if (!issuerToSlug.has(c.issuer)) {
      let slug = slugifyBankName(c.issuer);
      // Ensure uniqueness
      let unique = slug;
      let i = 2;
      while (slugToIssuer.has(unique) && slugToIssuer.get(unique) !== c.issuer) {
        unique = `${slug}-${i++}`;
      }
      slug = unique;
      issuerToSlug.set(c.issuer, slug);
      slugToIssuer.set(slug, c.issuer);
    }
  });

  return { issuerToSlug, slugToIssuer };
}

export function getAllBanks(): BankSummary[] {
  const byIssuer = new Map<string, CreditCard[]>();
  cardsData.forEach((c) => {
    byIssuer.set(c.issuer, [...(byIssuer.get(c.issuer) || []), c]);
  });

  const { issuerToSlug } = buildIssuerSlugIndex(cardsData);

  const banks: BankSummary[] = Array.from(byIssuer.entries()).map(([issuer, cards]) => {
    const top = [...cards]
      .sort((a, b) => (b.popularityScore + b.rewardStrengthScore) - (a.popularityScore + a.rewardStrengthScore))
      .slice(0, 3)
      .map((c) => c.id);

    return {
      issuer,
      slug: issuerToSlug.get(issuer) || slugifyBankName(issuer),
      count: cards.length,
      topCardIds: top,
    };
  });

  return banks.sort((a, b) => b.count - a.count || a.issuer.localeCompare(b.issuer));
}

export function getCardsByIssuer(issuer: string): CreditCard[] {
  return cardsData.filter((c) => c.issuer === issuer);
}

export function getIssuerBySlug(slug: string): string | null {
  const { slugToIssuer } = buildIssuerSlugIndex(cardsData);
  return slugToIssuer.get(slug) || null;
}

