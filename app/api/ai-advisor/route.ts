import { NextResponse } from "next/server";
import OpenAI from "openai";

const MODEL = "gemini-1.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contents = body?.contents;

    if (!Array.isArray(contents) || contents.length === 0) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY || 
                      process.env.NEXT_PUBLIC_GEMINI_KEY || 
                      process.env.GOOGLE_API_KEY || 
                      process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    const openaiKey = process.env.OPENAI_API_KEY;

    // Sanitize contents to ensure strict alternation of user/model roles for Gemini
    const sanitizedContents: any[] = [];
    for (const message of contents) {
      const role = message.role === "assistant" || message.role === "model" ? "model" : "user";
      const text = message.parts.map((p: any) => p.text).join("");

      if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
        // Combine with previous message
        sanitizedContents[sanitizedContents.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        // Add new message
        sanitizedContents.push({
          role: role,
          parts: [{ text }]
        });
      }
    }

    const errors: any[] = [];

    // Attempt Gemini First
    if (geminiKey) {
      const geminiModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-8b", "gemini-pro"];
      for (const model of geminiModels) {
        try {
          const response = await fetch(
            `${API_BASE}/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: sanitizedContents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
              }),
            }
          );

          const data = await response.json();
          if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return NextResponse.json(data);
          }
          errors.push(`Gemini (${model}): ${data?.error?.message || "Unknown error"}`);
          console.error(`Gemini model ${model} failed...`, data?.error || "Empty response");
        } catch (err: any) {
          errors.push(`Gemini fetch error: ${err.message}`);
          console.error(`Gemini fetch error for ${model}...`, err);
        }
      }
    } else {
      errors.push("Gemini API key not configured.");
    }

    // Fallback to OpenAI if Gemini fails or is not configured
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
          // Mock the Gemini structure for the frontend
          return NextResponse.json({
            candidates: [{
              content: { parts: [{ text }] }
            }]
          });
        }
      } catch (err: any) {
        errors.push(`OpenAI fallback failed: ${err.message}`);
        console.error("OpenAI fallback failed...", err);
      }
    } else {
      errors.push("OpenAI API key not configured.");
    }

    // If we reach here, all services failed
    return NextResponse.json(
      { error: `AI Failed. Reasons: ${errors.join(" | ")}` },
      { status: 503 }
    );

  } catch (error: any) {
    console.error("AI Advisor Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
