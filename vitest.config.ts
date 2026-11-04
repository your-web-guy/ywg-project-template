import path from 'path'
import { defineConfig } from 'vitest/config'

/* Kept separate from vite.config.ts on purpose. That config loads the
   TanStack Router plugin, which regenerates src/routeTree.gen.ts as a side
   effect, and a test run must never change the working tree. Tests also need
   no Tailwind pipeline or browser environment.

   Test files import describe/it/expect from 'vitest' explicitly (globals off).
   Unit tests sit next to the code (src/**) or under tests/; the invariants
   suite lives in tests/invariants/. */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
})
