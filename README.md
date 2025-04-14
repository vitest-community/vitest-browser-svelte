# vitest-browser-svelte

Render Svelte components in Vitest Browser Mode. This library follows `testing-library` principles and exposes only [locators](https://vitest.dev/guide/browser/locators) and utilities that encourage you to write tests that closely resemble how your Svelte components are used.

Requires `vitest` and `@vitest/browser` 2.1.0 or higher.

```tsx
import { render } from 'vitest-browser-svelte'
import { expect, test } from 'vitest'
import Component from './Component.svelte'

test('counter button increments the count', async () => {
  const screen = render(Component, {
    initialCount: 1,
  })

  await screen.getByRole('button', { name: 'Increment' }).click()

  await expect.element(screen.getByText('Count is 2')).toBeVisible()
})
```

> [!NOTE]
> This library doesn't expose or use `act`. Instead, you should use Vitest's locators and `expect.element` API that have [retry-ability mechanism](https://vitest.dev/guide/browser/assertion-api) baked in.

`vitest-browser-svelte` also automatically injects `render` and `cleanup` methods on the `page`. Example:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // if the types are not picked up, add `vitest-browser-svelte` to
    // "compilerOptions.types" in your tsconfig or
    // import `vitest-browser-svelte` manually so TypeScript can pick it up
    setupFiles: ['vitest-browser-svelte'],
    browser: {
      name: 'chromium',
      enabled: true,
    },
  },
})
```

```tsx
import { page } from '@vitest/browser/context'
import Component from './Component.svelte'

test('counter button increments the count', async () => {
  const screen = page.render(Component, {
    initialCount: 1,
  })

  screen.cleanup()
})
```

Unlike `@testing-library/svelte`, `vitest-browser-svelte` cleans up the component before the test starts instead of after, so you can see the rendered result in your UI. To avoid auto-cleanup, import the `render` function from `vitest-browser-svelte/pure`.

## Special thanks

- Forked from [`@testing-library/svelte`](https://github.com/testing-library/svelte-testing-library)
