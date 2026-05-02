import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { profile, result } = await req.json();

    const prompt = `
      You are a luxury fintech advisor specializing in the Indian credit card market.
      Analyze the following optimization results and provide a brief, professional, and sophisticated explanation of the strategy.
      
      User Profile:
      - Annual Income: INR ${profile.income}
      - Credit Score: ${profile.creditScore}
      - Top Spend Categories: ${Object.entries(profile.categories).sort((a, b) => (b[1] as any) - (a[1] as any)).slice(0, 3).map(([k, v]) => `${k} (INR ${v})`).join(', ')}
      
      Recommended Strategy:
      ${result.recommendedCards.map((c: any) => `- ${c.card.name} (${c.card.issuer}): For ${c.categoryMapping.join(', ')}`).join('\n')}
      
      Net Annual Savings: INR ${result.netSavings}
      
      Guidelines:
      1. Use a tone that is premium, authoritative, and helpful.
      2. Explain WHY these cards were chosen based on the spend categories.
      3. Mention the "Net Annual Savings" as the primary goal.
      4. Keep it concise (max 3 short paragraphs).
      5. Do not use markdown headers. Use bold text for emphasis.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a premium financial optimization engine.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ explanation: response.choices[0].message.content });
  } catch (error) {
    console.error('AI Explanation Error:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}
