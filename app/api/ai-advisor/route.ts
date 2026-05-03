import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

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

    // 1. Try Gemini with official SDK
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        // Use flash 1.5
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Convert sanitizedContents to SDK format
        // history: [{ role: 'user', parts: [{ text: '...' }] }, ...]
        const history = sanitizedContents.slice(0, -1);
        const lastMessage = sanitizedContents[sanitizedContents.length - 1].parts[0].text;
        
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        if (text) {
          return NextResponse.json({
            candidates: [{ content: { parts: [{ text }] } }]
          });
        }
      } catch (err: any) {
        errors.push(`Gemini Error: ${err.message}`);
        console.error("Gemini SDK failed:", err);
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

    return NextResponse.json(
      { error: `AI Failed. ${errors.join(" | ")}` },
      { status: 503 }
    );

  } catch (error: any) {
    console.error("AI Advisor Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
