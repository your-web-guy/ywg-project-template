---
name: code-structure
description: Use when multiple workflows duplicate the same operational logic, when deciding what belongs in actions vs shared services, or when refactoring repeated operational blocks across domain flows. Use when adding new features that share mechanics with existing ones.
---

# Service Layer Architecture

## Overview

**Two-layer separation:** Actions orchestrate domain rules (the "why/when"), while a service layer centralizes reusable operational mechanics (the "how").

This prevents duplicated code, inconsistent behavior, and bugs fixed in one path but not others.

## When to Use

- Multiple callers need the same low-level operation (API calls, email sending, data transforms)
- You're copy-pasting operational logic between files
- A bug fix in one workflow doesn't propagate to others doing the same thing
- Adding a new feature that shares mechanics with existing flows

**Don't use when:** Logic is truly domain-specific and used by only one caller.

## Core Pattern

Orchestration Layer (Actions/Components)    Service Layer (Shared Mechanics)
├── owns business rules                     ├── owns reusable operations
├── owns state transitions                  ├── owns API/SDK interactions
├── owns auth/ownership checks              ├── owns data transforms
├── owns failure classification             ├── owns error formatting
├── owns retries / user-facing errors       └── returns structured results
└── calls service functions


**Rule of thumb:**
- "What this product flow means" → keep in actions/components
- "How to do this operation reliably" → move to service layer (src/services/)

## Quick Reference

| Design Principle | Do | Don't |
|---|---|---|
| API shape | Composable capability blocks | One giant "do everything" function |
| Inputs/outputs | Explicit params, structured returns | Hidden global state |
| Migration | Extract one block, replace one caller, verify | Refactor everything at once |
| Domain logic | Keep auth, policy, error classification in components | Let service mutate state directly |
| Extraction trigger | Logic repeated across 2+ callers | Logic used once (over-abstraction) |

## Anti-Patterns to Avoid

- **God service:** One huge function hides all control flow
- **Leaky service:** Service mutates database or global state directly
- **Over-abstraction:** Extracting logic used by only one caller
- **Inconsistent API:** Each function uses different argument styles

## Mental Model

New feature → write in component first → see repeated ops? → extract to src/services/
                                        → no repetition? → keep in component
