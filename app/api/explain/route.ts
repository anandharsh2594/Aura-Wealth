import { NextResponse } from "next/server";
import OpenAI from "openai";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function buildLocalFallbackExplanation(profile: any, result: any): string {
  const cats = profile?.categories || {};
  const topCategory = Object.entries(cats).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "spending";
  
  const recommendedCards = result?.recommendedCards || [];
  const cardLines = recommendedCards.slice(0, 3).map((rec: any) => {
    const name = rec?.card?.name || "Recommended Card";
    const issuer = rec?.card?.issuer || "Issuer";
    const tier = rec?.card?.tier || "Tier";
    const mapping = (rec?.categoryMapping || []).slice(0, 3).join(", ");
    const benefit = rec?.netBenefit ? ` (net benefit: ₹${rec.netBenefit})` : "";
    return `- **${name}** (${issuer}, ${tier}) for ${mapping}${benefit}`;
  }).join("\n");

  const netSavings = result?.netSavings ?? "N/A";
  const rewards = result?.totalAnnualRewards ?? "N/A";
  const fees = result?.totalAnnualFees ?? "N/A";
  const incomeStr = `₹${profile?.income}${profile?.isMonthly ? " / month" : " / year"}`;

  return (
    `**Wealth Optimization Blueprint (Audit Summary)**\n\n` +
    `**Client Snapshot:**\n` +
    `- Annual Net Savings Goal: **₹${netSavings}**\n` +
    `- Annual Rewards vs Fees: Rewards ₹${rewards} vs Fees ₹${fees}\n` +
    `- Reported Client Income: ${incomeStr}\n` +
    `- Primary Spend Signal: **${topCategory}**\n\n` +
    `**Strategy Overview:**\n` +
    `Based on your spending distribution, the portfolio is designed to route your highest-signal spend ` +
    `toward card benefits that maximize reward yield while keeping annual fees justified by net benefit.\n\n` +
    `**Recommended Card Approach:**\n` +
    `${cardLines || "- Use the recommended portfolio to align rewards with your spend mix."}\n\n` +
    `**How to Improve Further:**\n` +
    `1) Validate that your real-world spending categories match the recorded mix.\n` +
    `2) If any fee-bearing card is underutilized, shift that spend to higher-return categories.\n` +
    `3) Re-run the audit after 30–45 days of statement history to recalibrate.`
  );
}

export async function POST(req: Request) {
  try {
    const { profile, result } = await req.json();

    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const categories = profile.categories || {};
    const prompt = `
      You are a high-end financial advisor specializing in the Indian credit card market.
      
      Client Income: ₹${profile.income}
      Credit Score: ${profile.creditScore}
      
      Spending Mix:
      ${JSON.stringify(categories, null, 2)}
      
      Optimization Results:
      - Estimated Net Savings: ₹${result.netSavings}
      - Total Annual Rewards: ₹${result.totalAnnualRewards}
      - Total Annual Fees: ₹${result.totalAnnualFees}
      - Recommended Cards: ${result.recommendedCards.map((c: any) => c.card.name).join(", ")}
      
      Provide a detailed, premium strategic audit report (250-350 words). 
      Include spending analysis, card strategy breakdown, and specific advice on how to maximize yields further.
      Use a sophisticated, professional tone. Do not use markdown headers, use bold text for emphasis.
    `;

    // Try Gemini First (as in the Python backend)
    if (geminiKey) {
      try {
        const models = ["gemini-1.5-flash", "gemini-pro"];
        for (const model of models) {
          const response = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return NextResponse.json({ explanation: text });
          }
        }
      } catch (err) {
        console.error("Gemini failed, trying OpenAI...", err);
      }
    }

    // Fallback to OpenAI
    if (openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: "You are a premium financial optimization engine." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 800,
        });
        return NextResponse.json({ explanation: response.choices[0].message.content });
      } catch (err) {
        console.error("OpenAI failed...", err);
      }
    }

    // Final Fallback
    return NextResponse.json({ explanation: buildLocalFallbackExplanation(profile, result) });

  } catch (error) {
    console.error("AI Audit Error:", error);
    return NextResponse.json({ error: "Failed to generate audit" }, { status: 500 });
  }
}
