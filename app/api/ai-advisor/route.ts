import { NextResponse } from "next/server";
import OpenAI from "openai";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function buildLocalFallbackResponse(sanitizedContents: any[]): string {
  try {
    const firstMessage = sanitizedContents[0]?.parts?.[0]?.text || "";
    const lastMessage = sanitizedContents[sanitizedContents.length - 1]?.parts?.[0]?.text || "";

    const categoryMatch = lastMessage.match(/\[detected_category:\s*([^\]]+)\]/i);
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : "general";

    // Avoid RegExp dotAll flag (s) for older TS targets in some build pipelines.
    const jsonMatch = firstMessage.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (!jsonMatch) return "I recommend checking out our premium cards based on your spending profile.";

    const cards = JSON.parse(jsonMatch[0]);

    let bestCard = cards[0];
    for (const card of cards) {
      const typeStr = (card.type || "").toLowerCase();
      const bestForStr = (card.bestFor || "").toLowerCase();
      if (typeStr.includes(category) || bestForStr.includes(category)) {
        bestCard = card;
        break;
      }
    }

    return `**🏆 Best Card for This:** ${bestCard.name}
Perfect for ${category} spending.
**Estimated Reward:** Varies based on exact spend.
**Key Benefit:** ${bestCard.benefits.split(" | ")[0] || "Great rewards"}
**Annual Fee:** ₹${bestCard.fee || 0}

---

**💡 Pro Tip:** Shortlist 2 cards for your top 2 spend categories, then route spends consistently for 30 days and re-check the best performer.`;

  } catch (err) {
    return "Try the HDFC Millennia for strong all‑round cashback, or SBI SimplyCLICK for online shopping value.";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contents = body?.contents;

    if (!Array.isArray(contents) || contents.length === 0) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    // Server-side only: configure these in Vercel Project Settings → Environment Variables.
    // Do NOT rely on NEXT_PUBLIC_* keys for server routes.
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    const openaiKey = process.env.OPENAI_API_KEY;
    const errors: string[] = [];

    // Sanitize contents for Gemini
    const sanitizedContents: any[] = [];
    for (const message of contents) {
      const role = message.role === "assistant" || message.role === "model" ? "model" : "user";
      const text = message.parts.map((p: any) => p.text).join("");
      
      if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
        sanitizedContents[sanitizedContents.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        sanitizedContents.push({ role, parts: [{ text }] });
      }
    }

    // 1. Try Gemini via HTTP (avoids SDK dependency issues in deploy)
    if (geminiKey) {
      try {
        const models = ["gemini-1.5-flash", "gemini-pro"];
        const payload = {
          contents: sanitizedContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        };

        for (const model of models) {
          const resp = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!resp.ok) {
            const errText = await resp.text().catch(() => "");
            errors.push(`Gemini HTTP ${model} failed: ${resp.status} ${errText}`.slice(0, 500));
            continue;
          }

          const data: any = await resp.json().catch(() => null);
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return NextResponse.json({
              candidates: [{ content: { parts: [{ text }] } }],
            });
          }
        }
      } catch (err: any) {
        errors.push(`Gemini Error: ${err?.message || String(err)}`);
        console.error("Gemini HTTP failed:", err);
      }
    } else {
      errors.push("Gemini key missing.");
    }

    // 2. Fallback to OpenAI
    if (openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const messages: any[] = sanitizedContents.map(m => ({
          role: m.role === "model" ? "assistant" : "user",
          content: m.parts.map((p: any) => p.text).join("")
        }));

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        });

        const text = completion.choices[0].message.content;
        if (text) {
          return NextResponse.json({
            candidates: [{ content: { parts: [{ text }] } }]
          });
        }
      } catch (err: any) {
        errors.push(`OpenAI Error: ${err.message}`);
        console.error("OpenAI failed:", err);
      }
    } else {
      errors.push("OpenAI key missing.");
    }

    // 3. Final Local Fallback (Matches Deep AI Audit behavior)
    console.error("AI completely failed, using local fallback. Errors:", errors);
    const fallbackText = buildLocalFallbackResponse(sanitizedContents);
    return NextResponse.json({
      candidates: [{ content: { parts: [{ text: fallbackText }] } }]
    });

  } catch (error: any) {
    // Never hard-fail the chatbot; always return a usable response.
    console.error("AI Advisor Route Error (falling back):", error);
    try {
      const body = await req.json().catch(() => ({}));
      const contents = body?.contents;
      const safeContents = Array.isArray(contents) ? contents : [];
      const fallbackText = buildLocalFallbackResponse(safeContents);
      return NextResponse.json({
        candidates: [{ content: { parts: [{ text: fallbackText }] } }],
      });
    } catch {
      return NextResponse.json({
        candidates: [{ content: { parts: [{ text: "I can help recommend the best card for a purchase—tell me what you’re buying and the approximate amount." }] } }],
      });
    }
  }
}
