# [Project Name]

**Client:** [Client Name]
**Stack:** React 19 · Vite · TanStack Router · Tailwind CSS 4 · shadcn/ui · Bun · Cloudflare Workers
**Managed by:** Your Web Guy (richard@yourwebguy.org)

---

## Branch Flow

```
dev → staging → main
```

- `dev` — Claude Code's working branch. Unprotected.
- `staging` — client review. Auto-deploys on push. Protected.
- `main` — production. Auto-deploys on push. Protected.

Never commit directly to staging or main.

## Local Development

```bash
bun install
bun run dev
```

Open http://localhost:5173

## Tests

```bash
bun run test
bun run test:invariants
```

Vitest runs everything under `src/**/*.test.{ts,tsx}` and `tests/`. CI (`.github/workflows/ci.yml`) runs build, lint and test on every pull request into dev, staging or main, as the `ci` check.

## Cloudflare Setup (once per project)

```bash
./scripts/provision.sh [project-name]
```

Fills in the project name, creates the `staging` and `production` GitHub environments, and pushes the Cloudflare secrets to both. Deploys only happen through GitHub Actions; never run `wrangler deploy` by hand.

## Adding Components

```bash
bunx shadcn@latest add [component-name]
```

## Docs

- `plans/handoff.md` — Claude Code handoff document, Current State first
- `invariants.toml` — rules the code must never break, each with a test
- `docs/PRD.md` — Product Requirements Document
- `docs/IMPLEMENTATION-PLAN.md` — Ticket list with wave assignments

## Environment Variables

Copy `.env.example` to `.env` and fill in values before running locally.
