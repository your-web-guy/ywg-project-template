# plans/

This folder contains the Claude Code handoff document for this project.

## What belongs here

One file per project (or per major phase if scope expands mid-project):
`[project-name]-handoff.md`

## Handoff doc format

The handoff doc is written in Claude Cowork at the end of the planning phase
(after OES, wireframes, PRD, and implementation plan are complete). It is the
first file committed to this repo when Claude Code opens for the first time.

### Required sections

**Context Prompt** — Full prompt for Claude Code to read at session start.
Includes: project name, client, what is being built, tech stack, current phase,
key constraints.

**Project Status at Handoff** — What is complete in Cowork (wireframes, PRD,
content audit, etc.) and what Claude Code is about to start.

**Files Claude Code Needs** — Table of file paths in the Cowork tree that Claude
Code should read before building. Includes PRD, wireframes, implementation plan,
content audit, exports, etc.

**Working Branch** — Always `dev`.

**Board URL** — Link to the GitHub Project board for this project.

**Open Questions** — Any decisions that still need Richard's call before certain
tickets can start.

## Reference model

See: ~/Documents/Claude/Executive Assistant/EEDA/EEDA-Claude-Code-Handoff.md
