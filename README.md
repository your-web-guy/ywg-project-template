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

## Adding Components

```bash
bunx shadcn@latest add [component-name]
```

## Docs

- `plans/` — Claude Code handoff document
- `docs/PRD.md` — Product Requirements Document
- `docs/IMPLEMENTATION-PLAN.md` — Ticket list with wave assignments

## Environment Variables

Copy `.env.example` to `.env` and fill in values before running locally.
