"use client";

import { useMemo, useState } from "react";
import type { CreditCard } from "../../explore/data/types";
import { useCardCatalog, UserCard } from "../../lib/userCards";

function toIdSlug(name: string, issuer: string) {
  return `${issuer}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
}

const NETWORKS: CreditCard["network"][] = ["Visa", "Mastercard", "Amex", "RuPay"];
const APPROVALS: CreditCard["approvalDifficulty"][] = ["easy", "moderate", "premium"];

const CATEGORY_OPTIONS = [
  "travel",
  "dining",
  "fuel",
  "groceries",
  "online shopping",
  "jewelry",
  "entertainment",
  "utilities",
  "international",
  "general",
] as const;

const CARD_TYPES = [
  "cashback",
  "travel",
  "fuel",
  "premium",
  "lifestyle",
  "beginner",
  "business",
  "secured",
] as const;

export default function AdminCardsPage() {
  const { mergedCards, userCards, setUserCards } = useCardCatalog();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<UserCard>({
    id: "",
    name: "",
    issuer: "",
    network: "Visa",
    image: "/cards/custom.png",
    annualFee: 0,
    joiningFee: 0,
    bestFor: "",
    cardType: ["beginner"],
    approvalDifficulty: "easy",
    rewardCategories: ["general"],
    rewardRate: "",
    keyBenefits: [],
    loungeAccess: false,
    fuelSurchargeWaiver: false,
    welcomeBonus: null,
    popularityScore: 50,
    rewardStrengthScore: 50,
    beginnerScore: 50,
    tags: [],
    applyUrl: "#",
    __source: "user",
  });

  const filteredUserCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return userCards;
    return userCards.filter(
      (c) => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [search, userCards]);

  const resetForm = () => {
    setEditingId(null);
    setForm((prev) => ({
      ...prev,
      id: "",
      name: "",
      issuer: "",
      network: "Visa",
      image: "/cards/custom.png",
      annualFee: 0,
      joiningFee: 0,
      bestFor: "",
      cardType: ["beginner"],
      approvalDifficulty: "easy",
      rewardCategories: ["general"],
      rewardRate: "",
      keyBenefits: [],
      loungeAccess: false,
      fuelSurchargeWaiver: false,
      welcomeBonus: null,
      popularityScore: 50,
      rewardStrengthScore: 50,
      beginnerScore: 50,
      tags: [],
      applyUrl: "#",
      __source: "user",
    }));
  };

  const upsert = () => {
    if (!form.name.trim() || !form.issuer.trim()) {
      alert("Card name and issuer are required.");
      return;
    }

    const id = form.id.trim() || toIdSlug(form.name, form.issuer);
    if (!id) {
      alert("Unable to generate a card id.");
      return;
    }

    // Prevent collision with base catalog ids
    const baseHas = mergedCards.some((c) => c.id === id && !(userCards as any).some((u: UserCard) => u.id === id));
    if (baseHas && !editingId) {
      alert("This id already exists in the base catalog. Change the id.");
      return;
    }

    const next: UserCard = {
      ...form,
      id,
      annualFee: Number(form.annualFee) || 0,
      joiningFee: Number(form.joiningFee) || 0,
      popularityScore: Math.max(0, Math.min(100, Number(form.popularityScore) || 0)),
      rewardStrengthScore: Math.max(0, Math.min(100, Number(form.rewardStrengthScore) || 0)),
      beginnerScore: Math.max(0, Math.min(100, Number(form.beginnerScore) || 0)),
      keyBenefits: (form.keyBenefits || []).filter(Boolean),
      tags: (form.tags || []).filter(Boolean),
      __source: "user",
    };

    const updated = editingId
      ? userCards.map((c) => (c.id === editingId ? next : c))
      : [{ ...next }, ...userCards];

    setUserCards(updated);
    resetForm();
  };

  const startEdit = (card: UserCard) => {
    setEditingId(card.id);
    setForm({ ...card, __source: "user" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (id: string) => {
    if (!confirm("Delete this card?")) return;
    setUserCards(userCards.filter((c) => c.id !== id));
    if (editingId === id) resetForm();
  };

  const toggleArray = (key: "rewardCategories" | "cardType", value: string) => {
    setForm((p) => {
      const arr = new Set(p[key] || []);
      if (arr.has(value)) arr.delete(value);
      else arr.add(value);
      return { ...p, [key]: Array.from(arr) as any };
    });
  };

  const setCommaList = (key: "keyBenefits" | "tags", val: string) => {
    const items = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((p) => ({ ...p, [key]: items as any }));
  };

  return (
    <main className="relative min-h-screen">
      <div className="pt-32 pb-10 px-6 md:px-12 max-w-[1440px] mx-auto">
        <h1 className="font-display-xl text-4xl md:text-display-xl text-on-background italic mb-3">
          Admin • Card Catalog
        </h1>
        <p className="text-slate-400 max-w-3xl">
          Add cards directly from the website. Stored locally in your browser (no import needed). These cards will appear in Explore and be used by the optimizer on this device.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Base cards: {mergedCards.length - userCards.length}
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Your cards: {userCards.length}
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Total on this device: {mergedCards.length}
          </span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 glass-card rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-headline-md text-xl mb-4">
            {editingId ? `Edit Card: ${editingId}` : "Add a New Card"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Card Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="HDFC Diners Club Black"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Issuer</label>
              <input
                value={form.issuer}
                onChange={(e) => setForm((p) => ({ ...p, issuer: e.target.value }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="HDFC Bank"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">ID (optional)</label>
              <input
                value={form.id}
                onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="auto-generated"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Network</label>
              <select
                value={form.network}
                onChange={(e) => setForm((p) => ({ ...p, network: e.target.value as any }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              >
                {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Approval Difficulty</label>
              <select
                value={form.approvalDifficulty}
                onChange={(e) => setForm((p) => ({ ...p, approvalDifficulty: e.target.value as any }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              >
                {APPROVALS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Annual Fee</label>
              <input
                type="number"
                value={form.annualFee}
                onChange={(e) => setForm((p) => ({ ...p, annualFee: Number(e.target.value) }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Joining Fee</label>
              <input
                type="number"
                value={form.joiningFee}
                onChange={(e) => setForm((p) => ({ ...p, joiningFee: Number(e.target.value) }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Best For</label>
              <input
                value={form.bestFor}
                onChange={(e) => setForm((p) => ({ ...p, bestFor: e.target.value }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Travel rewards & lounge access"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Reward Rate (text)</label>
              <input
                value={form.rewardRate}
                onChange={(e) => setForm((p) => ({ ...p, rewardRate: e.target.value }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="5% cashback on online shopping"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Apply URL (optional)</label>
              <input
                value={form.applyUrl}
                onChange={(e) => setForm((p) => ({ ...p, applyUrl: e.target.value }))}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="https://issuer.com/apply..."
              />
              <p className="text-[11px] text-slate-500 mt-1">Leave as “#” to use issuer apply page fallback.</p>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Key Benefits (comma separated)</label>
              <input
                value={(form.keyBenefits || []).join(", ")}
                onChange={(e) => setCommaList("keyBenefits", e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Lounge access, Fuel waiver, Concierge"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Tags (comma separated)</label>
              <input
                value={(form.tags || []).join(", ")}
                onChange={(e) => setCommaList("tags", e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                placeholder="Airport Lounge, Premium Pick"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Reward Categories</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleArray("rewardCategories", opt)}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      form.rewardCategories.includes(opt)
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Card Types</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CARD_TYPES.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleArray("cardType", opt)}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      form.cardType.includes(opt)
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Popularity</label>
                <input
                  type="number"
                  value={form.popularityScore}
                  onChange={(e) => setForm((p) => ({ ...p, popularityScore: Number(e.target.value) }))}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Reward Strength</label>
                <input
                  type="number"
                  value={form.rewardStrengthScore}
                  onChange={(e) => setForm((p) => ({ ...p, rewardStrengthScore: Number(e.target.value) }))}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Beginner</label>
                <input
                  type="number"
                  value={form.beginnerScore}
                  onChange={(e) => setForm((p) => ({ ...p, beginnerScore: Number(e.target.value) }))}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-4 items-center pt-2">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.loungeAccess}
                  onChange={(e) => setForm((p) => ({ ...p, loungeAccess: e.target.checked }))}
                />
                Lounge Access
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.fuelSurchargeWaiver}
                  onChange={(e) => setForm((p) => ({ ...p, fuelSurchargeWaiver: e.target.checked }))}
                />
                Fuel Waiver
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={upsert}
              className="gold-gradient text-on-primary px-6 py-3 rounded-xl text-xs font-label-sm uppercase tracking-[0.15em] hover:shadow-[0_0_20px_rgba(242,202,80,0.25)] transition-all"
            >
              {editingId ? "Save Changes" : "Add Card"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border border-white/10 text-slate-400 px-6 py-3 rounded-xl text-xs font-label-sm uppercase tracking-wider hover:border-white/20 transition-all"
            >
              Reset
            </button>
          </div>
        </section>

        <section className="lg:col-span-7 glass-card rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-5">
            <h2 className="text-white font-headline-md text-xl">Your Cards</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              placeholder="Search your cards…"
            />
          </div>

          {filteredUserCards.length === 0 ? (
            <div className="text-slate-500 text-sm">
              No user-added cards yet. Use the form on the left to add your first card.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUserCards.map((c) => (
                <div key={c.id} className="border border-white/10 bg-white/5 rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">{c.name}</div>
                    <div className="text-slate-500 text-xs truncate">{c.issuer} • {c.network} • {c.approvalDifficulty}</div>
                    <div className="text-slate-400 text-xs mt-1 truncate">id: {c.id}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

