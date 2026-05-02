import os
import json
import urllib.request
import urllib.error
import time
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# The .env file has GOOGLE_API_KEY, not GEMINI_API_KEY
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")


app = FastAPI(title="Aura Wealth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MODELS ----------------

class SpendingCategories(BaseModel):
    dining: float = 0
    travel: float = 0
    fuel: float = 0
    groceries: float = 0
    onlineShopping: float = 0
    utilityBills: float = 0
    jewelry: float = 0
    other: float = 0


class Profile(BaseModel):
    income: float
    creditScore: int
    categories: SpendingCategories
    isMonthly: bool


class AIExplanationRequest(BaseModel):
    result: Dict
    profile: Profile


# ---------------- CARD DATA ----------------

CARDS = [
    {
        "id": "hdfc-infinia",
        "name": "Infinia Metal Edition",
        "issuer": "HDFC",
        "tier": "Super Premium",
        "annualFee": 12500,
        "rewards": {"travel": 0.33, "dining": 0.15, "other": 0.033},
    },
    {
        "id": "axis-ace",
        "name": "Axis ACE",
        "issuer": "Axis",
        "tier": "Mid-Range",
        "annualFee": 499,
        "rewards": {"utilityBills": 0.05, "dining": 0.04, "other": 0.02},
    },
    {
        "id": "sbi-cashback",
        "name": "SBI Cashback",
        "issuer": "SBI",
        "tier": "Mid-Range",
        "annualFee": 999,
        "rewards": {"onlineShopping": 0.05, "other": 0.01},
    },
]

# ---------------- ROUTES ----------------

@app.get("/")
async def root():
    return {"message": "API running"}


@app.post("/optimize")
async def optimize(profile: Profile):
    multiplier = 12 if profile.isMonthly else 1
    total_rewards = 0
    used_cards = {}

    category_data = profile.categories.model_dump()

    for category, spend in category_data.items():
        yearly = spend * multiplier
        if yearly <= 0:
            continue

        best_card = None
        best_reward = 0

        for card in CARDS:
            rate = card["rewards"].get(category, card["rewards"].get("other", 0))
            reward = yearly * rate

            if reward > best_reward:
                best_reward = reward
                best_card = card

        if best_card:
            total_rewards += best_reward
            name = best_card["name"]

            if name not in used_cards:
                used_cards[name] = {
                    "card": best_card,
                    "categoryMapping": [category],
                    "netBenefit": best_reward,
                }
            else:
                used_cards[name]["categoryMapping"].append(category)
                used_cards[name]["netBenefit"] += best_reward

    recommended = list(used_cards.values())
    total_fees = sum(c["card"]["annualFee"] for c in recommended)

    return {
        "totalAnnualRewards": round(total_rewards),
        "totalAnnualFees": total_fees,
        "netSavings": round(total_rewards - total_fees),
        "recommendedCards": recommended,
    }


# ---------------- AI EXPLANATION ----------------

@app.post("/explain")
async def explain_strategy(request: AIExplanationRequest):

    def build_local_fallback_explanation(profile: AIExplanationRequest["profile"], result: Dict) -> str:
        # Deterministic explanation used when external AI providers are unavailable.
        # Keep it premium and structured so the UI + PDF export still work.
        categories = profile.categories.model_dump()
        top_category = max(categories.items(), key=lambda kv: kv[1])[0] if categories else "other"

        # Prepare a compact card summary (up to 3).
        recommended_cards = result.get("recommendedCards", []) if isinstance(result, dict) else []
        card_lines = []
        for rec in recommended_cards[:3]:
            card = rec.get("card", {}) or {}
            name = card.get("name") or "Recommended Card"
            issuer = card.get("issuer") or "Issuer"
            tier = card.get("tier") or "Tier"
            mapping = rec.get("categoryMapping") or []
            mapping_str = ", ".join(mapping[:3]) if isinstance(mapping, list) else ""
            benefit = rec.get("netBenefit")
            benefit_str = f" (net benefit: ₹{benefit})" if benefit is not None else ""
            card_lines.append(f"- {name} ({issuer}, {tier}) for {mapping_str}{benefit_str}".strip())

        if not card_lines:
            card_lines = ["- Use the recommended portfolio from the optimization results to align rewards with your spending mix."]

        is_monthly = bool(profile.isMonthly)
        income_str = f"₹{profile.income}" + (" / month" if is_monthly else " / year")

        net_savings = result.get("netSavings", "N/A")
        rewards = result.get("totalAnnualRewards", "N/A")
        fees = result.get("totalAnnualFees", "N/A")

        return (
            f"Subject: Wealth Optimization Blueprint (AI audit)\n\n"
            f"Client Snapshot:\n"
            f"- Annual Net Savings Goal: ₹{net_savings}\n"
            f"- Annual Rewards vs Fees: Rewards ₹{rewards} vs Fees ₹{fees}\n"
            f"- Reported Client Income: {income_str}\n"
            f"- Primary Spend Signal: {top_category}\n\n"
            f"Strategy Overview:\n"
            f"Based on your spending distribution, the portfolio is designed to route your highest-signal spend "
            f"toward card benefits that maximize reward yield while keeping annual fees justified by net benefit.\n\n"
            f"Recommended Card Approach:\n"
            f"{chr(10).join(card_lines)}\n\n"
            f"How to Improve Further:\n"
            f"1) Validate that your real-world spending categories match the recorded mix (especially the dominant category).\n"
            f"2) If any fee-bearing card is underutilized, shift that spend to higher-return categories or downgrade.\n"
            f"3) Re-run the audit after 30–45 days of statement history to recalibrate rewards vs fees."
        )

    if GEMINI_API_KEY:
        try:
            categories = request.profile.categories.model_dump()

            prompt = f"""
You are a high-end financial advisor.

Client Income: ₹{request.profile.income}
Credit Score: {request.profile.creditScore}

Spending:
{categories}

Results:
Savings: ₹{request.result['netSavings']}
Rewards: ₹{request.result['totalAnnualRewards']}
Fees: ₹{request.result['totalAnnualFees']}
Cards: {', '.join([c['card']['name'] for c in request.result['recommendedCards']])}

Write a detailed report:

1. Spending analysis
2. Card strategy (each card + category + benefit)
3. Savings explanation
4. Where money is being lost
5. How to improve further

Tone: professional, detailed, premium.
Length: 250-350 words.
"""

            # Gemini can occasionally return transient 5xx (e.g., 503).
            # Retry with backoff and fall back to another model so the UI
            # doesn't fail randomly.
            models_to_try = [
                "gemini-2.5-flash",
                "gemini-flash-latest",
            ]

            payload = {
                "contents": [
                    {"parts": [{"text": prompt}]}
                ]
            }

            last_error_msg = "Gemini request failed."

            for model in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"

                req = urllib.request.Request(
                    url,
                    json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                )

                for attempt in range(3):
                    try:
                        with urllib.request.urlopen(req, timeout=60) as res:
                            result = json.loads(res.read().decode())
                            text = result["candidates"][0]["content"]["parts"][0]["text"]
                            return {"explanation": text}
                    except urllib.error.HTTPError as e:
                        body = e.read().decode("utf-8", errors="replace")
                        last_error_msg = f"Gemini HTTP Error {e.code}: {body}"

                        # Retry only on transient errors
                        if e.code in (429, 500, 503) and attempt < 2:
                            time.sleep(1.5 * (2 ** attempt))
                            continue
                        break
                    except Exception as e:
                        last_error_msg = f"Gemini error: {str(e)}"
                        if attempt < 2:
                            time.sleep(1.0 * (2 ** attempt))
                            continue
                        break

            # Fallback to OpenAI if Gemini continues to fail.
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if openai_api_key:
                try:
                    client = OpenAI(api_key=openai_api_key)
                    response = client.chat.completions.create(
                        model="gpt-4-turbo-preview",
                        messages=[
                            {
                                "role": "system",
                                "content": "You are a high-end financial advisor specializing in the Indian credit card market.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        temperature=0.7,
                        max_tokens=500,
                    )
                    return {"explanation": response.choices[0].message.content}
                except Exception as e:
                    # If both providers fail, return the Gemini error (most relevant to debugging).
                    print(f"OpenAI fallback error: {str(e)}")

            # Guaranteed fallback so the UI never shows a raw upstream failure.
            return {"explanation": build_local_fallback_explanation(request.profile, request.result)}

        except Exception as e:
            error_msg = f"Gemini error: {str(e)}"
            print(error_msg)
            return {"explanation": build_local_fallback_explanation(request.profile, request.result)}

    return {
        "explanation": "AI analysis currently unavailable. Please check if GOOGLE_API_KEY is in your .env file."
    }


# ---------------- RUN ----------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
