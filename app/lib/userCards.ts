"use client";

import type { CreditCard } from "../explore/data/types";
import baseCardsData from "../explore/data/cardsData";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "aura_user_cards_v1";

export type UserCard = CreditCard & { __source?: "user" };

export function loadUserCards(): UserCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as UserCard[];
  } catch {
    return [];
  }
}

export function saveUserCards(cards: UserCard[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function getMergedCards(baseCards: CreditCard[], userCards: UserCard[]): CreditCard[] {
  const seen = new Set(baseCards.map((c) => c.id));
  const safeUser = userCards
    .filter((c) => c && typeof c.id === "string" && c.id.trim().length > 0)
    .map((c) => ({ ...c, __source: "user" as const }))
    .filter((c) => !seen.has(c.id));

  return [...baseCards, ...safeUser];
}

export function useCardCatalog() {
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadUserCards();
    setUserCards(loaded);
    setReady(true);

    const handler = () => setUserCards(loadUserCards());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const mergedCards = useMemo(
    () => getMergedCards(baseCardsData, userCards),
    [userCards]
  );

  return {
    ready,
    baseCards: baseCardsData,
    userCards,
    mergedCards,
    setUserCards: (next: UserCard[]) => {
      setUserCards(next);
      saveUserCards(next);
    },
  };
}

