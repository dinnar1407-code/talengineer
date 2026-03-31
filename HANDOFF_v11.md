# Talengineer v11.0: Transition Handoff Document

## 1. Project Paradigm Shift
We successfully decoupled the industrial automation outsourcing platform from the original crypto-focused `wheatcommunity.app`. The new repository `talengineer` is a pure B2B SaaS platform designed to be the "Last-Mile Infrastructure" for Chinese manufacturing equipment deployed globally (specifically NA/MX).

## 2. Core Four-Engine Architecture (Carbon-Silicon Hybrid)
This version successfully integrates four AI-driven core engines, all running on the `Gemini 2.5 Flash` model to drastically reduce cross-border friction:

### Step 1: The AI Scope Engine (AI 需求解析与标准化引擎)
- **Problem**: Chinese suppliers struggle to write standard English Statements of Work (SoW).
- **Solution**: A Chinese plaintext input on the frontend (`talent.html`) calls `/api/demand/parse`. Gemini instantly extracts skills, writes a professional English SoW, and calculates 3-4 optimal Escrow Milestones with proportional budget splits.

### Step 2: The AI Matchmaker (AI 智能红娘与触达引擎)
- **Problem**: Waiting for engineers to find the job is too slow.
- **Solution**: Once a project is posted, `matchmakerService.js` automatically queries the database for top-rated local engineers (e.g., in Mexico) and uses Gemini to write a highly persuasive, customized cold-outreach email in their native language (Spanish).

### Step 3: The Babel War Room (全语种工程作战室)
- **Problem**: Real-time communication breakdown between Chinese suppliers and local engineers during project execution.
- **Solution**: A dedicated real-time chat interface (`warroom.html`) powered by `socket.io`. Messages sent in Chinese are instantly intercepted, translated into highly accurate industrial Spanish by Gemini, and broadcasted to the counterparty (and vice versa).

### Step 4: Stripe Connect Escrow Mockup (真金白银分账系统)
- **Problem**: High risk and compliance issues with cross-border freelancer payouts.
- **Solution**: The finance dashboard (`finance.html`) allows the employer to "Fund via Stripe" (locking fiat into the platform's escrow). Upon completion, "Approve & Release" automatically deducts a 15% platform commission and simulates the payout to the engineer's local connected account.

## 3. Tech Stack & State
- **Frontend**: Clean, enterprise B2B white/blue theme. Unified navbar across `index.html`, `talent.html`, `finance.html`, and `warroom.html`. 
- **Internationalization (i18n)**: Seamless EN/ZH/ES language toggling using `localStorage` to persist user preference.
- **Backend API**: Modular `Express.js` (`routes/talent.js`, `routes/finance.js`, `routes/auth.js`, `routes/demand.js`, `routes/payment.js`).
- **Database**: Currently running locally on `better-sqlite3` to emulate Supabase. The schema (`users`, `talents`, `demands`, `project_milestones`, `financial_ledgers`) is fully PostgreSQL/Supabase ready.

## 4. Next Phase Action Items (For Vercel / Production Deployment)
1. **Supabase Integration**: Replace the local SQLite DB by providing the real `SUPABASE_URL` and `SUPABASE_KEY` in the `.env` file.
2. **Stripe API Keys**: Inject real Stripe secret keys and replace the mock escrow logic with the actual Stripe Connect API.
3. **Email Delivery**: Connect an email provider (like SendGrid or AWS SES) to the `matchmakerService.js` to actually send the generated outreach emails.
4. **Deploy**: Push to Vercel/Railway and bind `www.talengineer.us`.
