# Aura Wealth | Elite Wealth Management

A premium credit card optimization engine designed for high-yield financial synthesis.

## Tech Stack
- **Frontend:** Next.js (App Router), Framer Motion, Tailwind CSS
- **Backend:** Python (FastAPI), Uvicorn
- **Design:** Custom Aura Wealth Design System

## Running the Application

### 1. Start the Frontend
```bash
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

## AI Features (so it works after deploy)

Both AI features are optional, but if you want them enabled in production you must set environment variables **server-side** (e.g. in Vercel).

- **Deep Audit (Wealth Optimizer)**: uses `OPENAI_API_KEY` (or `GEMINI_API_KEY`) via `/api/explain`
- **Chatbot (Explore → AI Card Advisor)**: uses `GEMINI_API_KEY` (or `OPENAI_API_KEY`) via `/api/ai-advisor`

### Vercel setup (recommended)

In **Vercel → Project → Settings → Environment Variables** add at least one:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)

Then redeploy (or trigger a new deployment) so the serverless functions pick up the values.

### If no keys are set

The app will still run and the chatbot will reply with a **local fallback recommendation** instead of failing.

## Core Features
- **Profile Audit:** Analyzes income and credit eligibility.
- **Spending Synthesis:** Maps monthly expenditure to optimal rewards.
- **Yield Blueprint:** Provides a multi-card strategy for maximum net annual savings.
- **Premium Aesthetics:** Institutional-grade UI with glassmorphism and gold-aura effects.
