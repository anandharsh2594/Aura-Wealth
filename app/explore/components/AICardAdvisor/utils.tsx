import React from 'react';
import { CreditCard } from "../../data/types";

// 1. Intent Detection & Amount Extraction
export function enrichMessage(userMessage: string): { enrichedMessage: string; tags: string[] } {
  let enrichedMessage = userMessage;
  const tags: string[] = [];

  const categories: Record<string, string[]> = {
    travel: ['flight', 'hotel', 'trip', 'travel', 'airline', 'dubai', 'booking', 'train', 'bus'],
    dining: ['restaurant', 'food', 'dining', 'eat', 'zomato', 'swiggy', 'cafe', 'dinner', 'lunch'],
    fuel: ['petrol', 'diesel', 'fuel', 'cng', 'gas'],
    groceries: ['grocery', 'groceries', 'supermarket', 'bigbasket', 'blinkit', 'zepto', 'dmart', 'milk'],
    shopping: ['shopping', 'amazon', 'flipkart', 'laptop', 'phone', 'myntra', 'clothes', 'buy'],
    jewelry: ['gold', 'jewelry', 'jewellery', 'tanishq', 'diamond'],
    utilities: ['bill', 'electricity', 'water', 'recharge', 'utility'],
    entertainment: ['movie', 'cinema', 'pvr', 'inox', 'bookmyshow', 'concert']
  };

  const lowerMsg = userMessage.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => lowerMsg.includes(kw))) {
      enrichedMessage += ` [detected_category: ${category}]`;
      tags.push(category);
    }
  }

  // Amount extraction
  const amountRegexes = [
    /₹\s*([\d,]+)/,
    /rs\.?\s*([\d,]+)/i,
    /([\d,]+)\s*lakhs?/i,
    /([\d,]+)\s*k\b/i,
    /([\d,]+)\s*thousand/i
  ];

  for (const regex of amountRegexes) {
    const match = lowerMsg.match(regex);
    if (match) {
      let numStr = match[1].replace(/,/g, '');
      let amount = parseFloat(numStr);
      
      if (regex.source.includes('lakh')) {
        amount *= 100000;
      } else if (regex.source.includes('k\\b') || regex.source.includes('thousand')) {
        amount *= 1000;
      }
      
      if (!isNaN(amount)) {
        enrichedMessage += ` [detected_amount: ${amount}]`;
        tags.push(`₹${amount.toLocaleString()}`);
        break; // Stop after finding first amount
      }
    }
  }

  return { enrichedMessage, tags };
}

// 2. System Prompt Builder
export function buildSystemPrompt(allCards: CreditCard[]): string {
  // Include all cards so recommendations scan the full universe.
  const minimalCards = allCards.map(c => ({
    name: c.name,
    issuer: c.issuer,
    fee: c.annualFee,
    bestFor: c.bestFor,
    rewards: c.rewardRate,
    benefits: c.keyBenefits.join(' | '),
    type: c.cardType.join(', ')
  }));

  const serializedCards = JSON.stringify(minimalCards);

  return `
You are an expert Indian credit card advisor embedded in a financial optimization platform. Your sole job is to analyze a user's spending intention and recommend the best 1–3 credit cards from the provided card database.

CARD DATABASE (use ONLY these cards from the complete database — never invent cards):
${serializedCards}

YOUR RESPONSE RULES:
1. Always identify: the spending category, transaction amount (if mentioned), and frequency (one-time or recurring).
2. Recommend the top 1–3 cards from the database that maximize rewards, cashback, or benefits for that specific spend.
3. For each recommended card, provide:
   - Card name and issuer
   - Why it is best for this specific purchase (1–2 sentences, very specific)
   - Estimated reward/cashback earned on this transaction (calculate using the card's reward rate)
   - Relevant benefits that apply (lounge, waiver, bonus, etc.)
   - Annual fee (and whether it is worth it for this use case)
4. If the user mentions an amount, always calculate the estimated reward value in rupees.
5. End every response with one smart follow-up tip — e.g. pairing cards, welcome bonus strategy, or fee waiver tip.
6. Keep the tone friendly, concise, and confident. No filler phrases. No disclaimers unless critical.
7. Format your response using this exact structure:

**🏆 Best Card for This:** [Card Name]
[Why it wins for this purchase]
**Estimated Reward:** ₹[amount] ([points/cashback type])
**Key Benefit:** [most relevant benefit]
**Annual Fee:** ₹[fee] ([worth it or free])

---

**Also Consider:**
[2nd card name] — [one-line reason]
[3rd card name] — [one-line reason]

---

**💡 Pro Tip:** [actionable follow-up tip]

8. If the user's query is unrelated to spending or credit cards, respond: "I'm specialized in credit card recommendations. Tell me about a purchase or spending habit and I'll find your best card!"
9. Never ask for personal financial data, income, or credit score.
10. Always respond in the same language the user writes in (English or Hinglish).
`;
}

// 3. Custom Markdown Parser
export function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // Horizontal rule
    if (line.trim() === '---') {
      if (inList) {
        elements.push(<ul key={`ul-${index}`} className="list-disc pl-5 my-2 space-y-1 text-on-surface/90">{listItems}</ul>);
        inList = false;
        listItems = [];
      }
      elements.push(<hr key={`hr-${index}`} className="my-4 border-white/10" />);
      return;
    }

    // Bullet points
    if (line.trim().startsWith('- ')) {
      inList = true;
      const content = parseInline(line.substring(2).trim());
      listItems.push(<li key={`li-${index}`}>{content}</li>);
      return;
    } else if (inList) {
      elements.push(<ul key={`ul-${index}`} className="list-disc pl-5 my-2 space-y-1 text-on-surface/90">{listItems}</ul>);
      inList = false;
      listItems = [];
    }

    // Normal paragraph
    if (line.trim() !== '') {
      elements.push(<p key={`p-${index}`} className="my-2 leading-relaxed text-on-surface/90">{parseInline(line)}</p>);
    } else {
      elements.push(<div key={`br-${index}`} className="h-1" />); // smaller spacing for empty lines
    }
  });

  if (inList) {
    elements.push(<ul key="ul-end" className="list-disc pl-5 my-2 space-y-1 text-on-surface/90">{listItems}</ul>);
  }

  return elements;
}

function parseInline(text: string): React.ReactNode[] {
  // Regex to match **bold**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
