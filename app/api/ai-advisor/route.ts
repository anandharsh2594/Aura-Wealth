import { NextResponse } from "next/server";

const MODEL = "gemini-flash-latest";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contents = body?.contents;

    if (!Array.isArray(contents) || contents.length === 0) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY (or NEXT_PUBLIC_GEMINI_KEY) in environment." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${API_BASE}/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Gemini request failed." },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }
}
