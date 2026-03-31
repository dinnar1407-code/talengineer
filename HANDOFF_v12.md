# Talengineer v12.0: The AI Management Pipeline

## Evolution from v11 to v12
Where v11 built the "trading and communication pipes", v12 introduces **AI-Agent Management** to handle the chaotic, physical-world delivery of cross-border industrial automation.

## The 4 New Deep-Tech Pillars:

### 1. AI-PM (Project Manager)
- **Role**: An automated supervisor living inside the Babel War Room.
- **Actions**:
  - `Nudge`: Employers can click a button to summon the AI-PM, which automatically drafts a polite but firm message in Spanish to ask the engineer for a progress update.
  - `Daily Report`: AI-PM reads the chat history across both languages and synthesizes a concise, structured Daily Progress Report in Chinese for the Employer.

### 2. AI-QC (Multimodal Quality Control)
- **Role**: Replaces manual oversight with AI Vision to approve/reject milestone payments.
- **Actions**:
  - Engineers upload photos of their work (e.g., PLC panels, wiring) directly into the War Room chat via the 📷 button.
  - The image is intercepted and sent to `Gemini 1.5 Pro/Flash Vision`.
  - The AI inspects the wiring, checks for red fault LEDs (like Siemens BF/SF), and outputs an immediate `PASS` or `REJECT` verdict, accompanied by bilingual reasoning.

### 3. Ghost HR Agent (Automated Sourcing)
- **Role**: Solves the "cold start" chicken-and-egg problem of a two-sided marketplace.
- **Actions**:
  - A backend script (`scripts/runGhostHR.js`) scrapes unstructured posts from LatAm engineering forums or LinkedIn.
  - Gemini parses the messy text into a perfect JSON profile, automatically injecting it into the platform's `talents` database.
  - Gemini drafts a highly persuasive, customized "You're pre-approved" Cold Email in Spanish to acquire the engineer.

### 4. Nexus Edge IoT API (Hardware-Software Sync)
- **Role**: Establishes the ultimate moat by connecting the physical equipment to the SaaS.
- **Actions**:
  - Exposes `POST /api/iot/machine-alert`.
  - When a Chinese machine breaks down in a Mexican factory, the machine's PLC calls this API with an error code (e.g., `F30001`).
  - The API injects a massive Red System Alert into the Babel War Room chat in real-time, automatically translating the fault description to both Chinese and Spanish, and calling the Engineer to action immediately.

## Status
All 4 pillars are fully built, tested via Gemini API, and integrated into the local prototype at `localhost:4000`. The platform is now a "Carbon-Silicon Hybrid" orchestrator.
