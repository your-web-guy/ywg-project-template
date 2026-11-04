/**
 * The invariants contract.
 *
 * Loads invariants.toml (repo root) and checks the file itself: every entry is
 * well formed, and every entry marked "implemented" names a test file that
 * exists and mentions its id. The rules themselves are asserted by the files
 * those entries name, normally one per invariant in this directory
 * (tests/invariants/inv-001.test.ts and so on).
 *
 * Entries that aren't implemented yet SKIP with a printed reason, so the
 * file can go in at Wave 0 and turn green as tickets land. If the skip list
 * isn't shrinking wave over wave, something isn't being built.
 */

import { describe, it, expect, afterAll } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'smol-toml'

const ROOT = join(import.meta.dirname, '..', '..')

const STATUSES = ['todo', 'in_progress', 'implemented', 'deprecated']
const CURRENT = ['holds', 'violated', 'unknown']
const KEYS = ['id', 'rule', 'check', 'refs', 'status', 'test', 'current']

type Entry = Record<string, unknown>

/** Everything wrong with one entry. Empty means it's well formed. */
function problems(e: Entry, root = ROOT): string[] {
  const out: string[] = []
  const id = typeof e.id === 'string' ? e.id : '(no id)'

  for (const k of Object.keys(e)) {
    if (!KEYS.includes(k)) out.push(`${id}: unknown key "${k}"`)
  }
  if (!/^INV-\d{3,}$/.test(String(e.id ?? ''))) out.push(`${id}: id must look like INV-001`)
  for (const k of ['rule', 'check']) {
    if (typeof e[k] !== 'string' || !(e[k] as string).trim()) out.push(`${id}: "${k}" is empty`)
  }
  if (!Array.isArray(e.refs) || e.refs.length === 0 || !e.refs.every(r => typeof r === 'string' && r.trim())) {
    out.push(`${id}: "refs" must list at least one source`)
  }
  if (!STATUSES.includes(e.status as string)) {
    out.push(`${id}: status "${String(e.status)}" is not one of ${STATUSES.join(', ')}`)
  }
  if (e.current !== undefined && !CURRENT.includes(e.current as string)) {
    out.push(`${id}: current "${String(e.current)}" is not one of ${CURRENT.join(', ')}`)
  }
  if (e.test !== undefined && typeof e.test !== 'string') out.push(`${id}: "test" must be a path string`)

  if (e.status === 'implemented') {
    const test = typeof e.test === 'string' ? e.test.trim() : ''
    if (!test) {
      out.push(`${id}: implemented but names no test`)
    } else if (!existsSync(join(root, test))) {
      out.push(`${id}: test file ${test} does not exist`)
    } else if (!readFileSync(join(root, test), 'utf8').includes(String(e.id))) {
      out.push(`${id}: ${test} never mentions ${String(e.id)}`)
    }
  }
  return out
}

const doc = parse(readFileSync(join(ROOT, 'invariants.toml'), 'utf8')) as {
  meta?: Entry
  invariant?: Entry[]
}
const entries = doc.invariant ?? []

describe('invariants.toml is well formed', () => {
  it('declares at least one invariant', () => {
    expect(entries.length, 'no [[invariant]] entries found').toBeGreaterThan(0)
  })

  it('every entry passes the contract', () => {
    expect(entries.flatMap(e => problems(e))).toEqual([])
  })

  it('ids are unique', () => {
    const ids = entries.map(e => e.id)
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(dupes, 'duplicate ids').toEqual([])
  })

  it('meta.updated is a quoted string, not a bare TOML date', () => {
    expect(typeof doc.meta?.updated).toBe('string')
  })

  it('the contract catches what it is for (positive control)', () => {
    const bad = { id: 'INV-1', rule: '', refs: [], status: 'done', stauts: 'todo' }
    expect(problems(bad).length).toBeGreaterThanOrEqual(5)
    const lying = { id: 'INV-999', rule: 'r', check: 'c', refs: ['PRD'], status: 'implemented', test: 'nope.test.ts' }
    expect(problems(lying)).toEqual(['INV-999: test file nope.test.ts does not exist'])
  })
})

describe('enforcement', () => {
  for (const e of entries) {
    const label = `${String(e.id)} ${String(e.rule)}`
    if (e.status === 'implemented') {
      it(`${label} (enforced by ${String(e.test)})`, () => {
        expect(problems(e)).toEqual([])
      })
    } else {
      it.skip(`${label} [${String(e.status)}]`, () => {})
    }
  }
})

// The skip summary. Written straight to stderr: Vitest swallows console output
// from tests, and this has to print on every run, passing or not.
afterAll(() => {
  const pending = entries.filter(e => e.status !== 'implemented')
  if (!pending.length) return
  const lines = pending.map(e => `  ${String(e.id)} [${String(e.status)}] ${String(e.rule)}`)
  process.stderr.write(`\n${pending.length} of ${entries.length} invariants not enforced yet:\n${lines.join('\n')}\n`)
})
