import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { playwright } from '@vitest/browser-playwright'
import { defaultClientConditions } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  optimizeDeps: {
    include: ['@testing-library/svelte-core'],
    force: true,
  },
  resolve: {
    conditions: process.env.CI ? [...defaultClientConditions] : ['vitest-browser-svelte:source', ...defaultClientConditions],
  },
  test: {
    name: 'svelte',
    browser: {
      enabled: true,
      headless: true,
      traceView: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
        {
          browser: 'chromium',
          name: 'custom-testid',
          include: ['./test/render-selector.test.ts'],
          locators: { testIdAttribute: 'data-custom-test-id' },
        },
      ],
    },
  },
})
