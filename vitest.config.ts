import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [svelte()],
  optimizeDeps: {
    include: ['@testing-library/svelte-core'],
  },
  test: {
    name: 'svelte',
    browser: {
      enabled: true,
      headless: true,
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
