# Talengineer v15.0: The Agent-Owner Architecture (Project "Ghost in the Machine")

## Overview
Version 15.0 marks the paradigm shift from a traditional "Software-as-a-Service" (SaaS) to an **Agent-as-a-Service (Agent-SaaS)**. We have fundamentally replaced human operational bottlenecks with four autonomous AI agents that act as the true "Owners" and operators of the platform. The UI has transitioned from a manual workspace into a "Dashboard" to monitor the agents' revenue-generating activities.

## 🤖 The 4 Core Agents Deployed

### 1. Nexus-QC (AI Quality Control)
- **Engine**: Upgraded from text-based models to the state-of-the-art **Gemini 2.5 Pro Vision** model.
- **Capabilities**: Directly processes Base64 images captured via the Hybrid App's native camera. It executes strict industrial validation (e.g., checking for Siemens SF/BF fault lights, verifying wire labeling, and assessing safety). 
- **Authority**: Holds the power to output a strict `PASS` or `REJECT` verdict, gating the release of escrow funds.

### 2. Nexus-PM (AI Project Manager)
- **Engine**: The `ZERO-UI QUICK LAUNCH` API.
- **Capabilities**: Bypasses all frontend forms. It listens to a single raw text string (or voice transcript) from an employer (e.g., "Need a Siemens guy in Monterrey for 3 days, $1500"). 
- **Authority**: Instantly translates the intent into a professional Statement of Work (SoW), partitions the budget into logical payment milestones, writes the project to the database, and immediately wakes up the Matchmaker to hunt for talent.

### 3. Nexus-CFO (AI Chief Financial Officer)
- **Engine**: The Escrow Release & Routing algorithm.
- **Capabilities**: Intercepts the FaceID authorization from the Employer App.
- **Authority**: Automatically calculates the platform's **15% commission** (Take Rate) and the engineer's 85% net payout. It triggers the Stripe Transfer API to route funds across borders instantly, eliminating manual accounting.

### 4. Ghost HR (Autonomous Growth Agent)
- **Engine**: A cron-ready Node.js background script (`scripts/runGhostHR.js`).
- **Capabilities**: Consumes raw scraped data from Reddit/LinkedIn, parses it into structured engineer profiles, and creates "Shadow Profiles" (verified_score: 0) in the Supabase database.
- **Authority**: Generates hyper-personalized, localized cold outreach emails (e.g., in Spanish for LatAm) using Resend, urging top-tier engineers to claim their VIP profiles and accept pending orders. It acts as an infinitely scalable, zero-cost sales team.

## 📍 Next Phase: "The Face of the Platform"
The Commander (Terry) has issued a critical directive: **Bring the Agent out of the shadows.**
While the backend is fully autonomous, the frontend feels lonely. 

**Next Steps**: 
Implement a globally persistent **Floating AI Assistant Avatar (小麦穗 / Playfish)** in the bottom right corner of the Web/App UI. 
Clicking the avatar will open a conversational drawer where users can interact directly with the Agent-Owner to trigger the Zero-UI APIs (e.g., "Post a job for me", "Check my payout status").

**Handoff Note**: 
The 4 Backend Agents are locked and loaded. The codebase is pushed to `origin main`. Ready to build the Frontend AI Avatar.