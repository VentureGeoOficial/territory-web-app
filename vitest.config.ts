import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/firestore-rules/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
