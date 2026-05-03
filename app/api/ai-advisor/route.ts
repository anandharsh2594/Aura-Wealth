import { NextResponse } from "next/server";

const MODEL = "gemini-1.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contents = body?.contents;

    if (!Array.isArray(contents) || contents.length === 0) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.NEXT_PUBLIC_GEMINI_KEY || 
                   process.env.GOOGLE_API_KEY || 
                   process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("AI Advisor Error: No API key found in environment variables.");
      return NextResponse.json(
        { error: "Missing Gemini API Key. Please configure GEMINI_API_KEY or GOOGLE_API_KEY." },
        { status: 500 }
      );
    }

    // Sanitize contents to ensure strict alternation of user/model roles for Gemini
    const sanitizedContents: any[] = [];
    for (const message of contents) {
      if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === message.role) {
        // Combine with previous message
        sanitizedContents[sanitizedContents.length - 1].parts.push({ text: "\n\n" });
        sanitizedContents[sanitizedContents.length - 1].parts.push(...message.parts);
      } else {
        // Add new message
        sanitizedContents.push({
          role: message.role === "assistant" ? "model" : message.role,
          parts: [...message.parts]
        });
      }
    }

    const response = await fetch(
      `${API_BASE}/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: sanitizedContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return NextResponse.json(
        { error: data?.error?.message || "Gemini request failed." },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Advisor Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
