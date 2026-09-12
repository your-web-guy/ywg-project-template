# [Project Name] — Claude Code Working Rules

**Client:** [Client Name]
**Stack:** React 19 · Vite · TanStack Router · Tailwind CSS 4 · shadcn/ui · Bun · Cloudflare Workers
**Working branch:** dev
**Repo:** your-web-guy/[project-name]
**Board:** [GitHub Project board URL]

Read `plans/[project-name]-handoff.md` at the start of every session.

---

**Scope note (added Sept 12, 2026):** the rules below govern builds made from this template, client and internal projects alike. They don't govern maintaining this template repo itself. Template fixes commit straight to main on Richard's direction, there's no ticket board or staging pipeline for the template, and there won't be one, it's a scaffold, not a shipping product.

---

## Working Rules

1. Always work from GitHub issues. Never build what isn't a ticket.
2. Move the ticket to In Progress on the project board before writing a single line of code.
3. Complete all Wave 0 tickets before starting any Wave 1 ticket. Complete all Wave 1 tickets before starting Wave 2.
4. **Code-Structure:** Never duplicate logic across files. If the same operation appears in more than one place, extract it to `src/services/`. Actions and components own business rules (why/when). Services own reusable mechanics (how).
5. **Code-Simplifier** runs automatically after each ticket is complete. Do not suppress it. Let it finish before committing.
6. After each ticket is complete: run Code-Simplifier → commit → open PR from `feat/ticket-XXX` → auto-merge to dev → post a comment on the GitHub issue summarizing what was built and linking the PR → move the card to Done on the project board.
7. Commit message format: `feat: TICKET-XXX [short description]`
8. Branch naming: `feat/ticket-XXX-short-description`
9. Never commit directly to staging or main.
10. If the wireframe and the PRD conflict, stop and ask Richard. Do not make the call yourself.
11. If a ticket's scope is ambiguous, ask before building. Do not assume.
12. Use shadcn/ui CSS variables for all colors (`bg-background`, `text-foreground`, `text-primary`, etc.). Never use raw Tailwind color values like `bg-stone-950`.
13. If the board has no ticket for what you're being asked to do, stop and say so before building. Do not quietly proceed and flag it afterwards.

---

## File Routing

Every file in `src/routes/` is a page. File name = URL.

- `src/routes/index.tsx` → `/`
- `src/routes/about.tsx` → `/about`
- `src/routes/contact.tsx` → `/contact`

`src/routeTree.gen.ts` is auto-generated. Never edit it manually.

---

## Architecture

```
src/
  routes/       ← pages (TanStack Router file-based routing)
  components/   ← shared UI components
  components/ui ← shadcn/ui components (do not edit directly)
  services/     ← shared reusable mechanics (Code-Structure layer)
  lib/          ← utilities (cn(), etc.)
  hooks/        ← shared React hooks
plans/          ← Claude Code handoff document
docs/           ← PRD and implementation plan
.claude/        ← Code-Structure and Code-Simplifier skills
```

---

## Session Start Prompt

At the start of every build session:

> "Read plans/[project-name]-handoff.md. Then look at the [Client] Build GitHub Project board and find the next open ticket in Backlog. Check its wave assignment — confirm all Wave 0 tickets are done before picking up a Wave 1 ticket. Move the ticket to In Progress and build it."
