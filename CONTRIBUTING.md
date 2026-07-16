# Contributing to TalEngineer

TalEngineer is a cross-border industrial automation engineering delivery platform
(connecting overseas manufacturers with global industrial automation engineers).

## Getting Started (Local Dev)

1. Clone the repo:
   ```bash
   git clone https://github.com/dinnar1407-code/talengineer.git
   cd talengineer
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the required keys
   (Supabase, JWT secret, Stripe test keys, Gemini API key).
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:4000`.

## Development Notes

- Run the test suite before committing: `npm test` (zero-dependency `node:test`).
- Build must stay green: `npm run build`.
- Payment-related changes must be verified in **Stripe test mode** first.
- Database migrations live in `migrations/` and are applied in version order.
- See `CLAUDE.md` for the full project context (stack, routes, roles).

## Making a Pull Request

1. Create your branch from `main`.
2. Keep changes focused; match the existing code style and comment conventions.
3. Make sure `npm test` and `npm run build` pass, then open the PR against `main`.
