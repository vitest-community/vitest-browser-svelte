import { expect, test } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-svelte'
import HelloWorld from './fixtures/HelloWorld.svelte'
import Counter from './fixtures/Counter.svelte'

test('renders simple component', async () => {
  const screen = render(HelloWorld)
  await expect.element(page.getByText('Hello World')).toBeVisible()
  expect(screen.container).toMatchSnapshot()
})

test('renders counter', async () => {
  const screen = render(Counter, {
    initialCount: 1,
  })

  await expect.element(screen.getByText('Count is 1')).toBeVisible()
  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('Count is 2')).toBeVisible()
})

// test trace output by:
// pnpm test render.test.ts --browser=chromium -t trace --browser.trace=on --run
// pnpm playwright show-trace test/__traces__/render.test.ts/vue--chromium--trace-mark-with-await-0-0.trace.zip
test('trace mark with await', async () => {
  const screen = await render(Counter, {
    initialCount: 1,
  })

  await expect.element(screen.getByText('Count is 1')).toBeVisible()
  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('Count is 2')).toBeVisible()

  await screen.rerender({ initialCount: -1 })
  await expect.element(screen.getByText('Count is 2')).toBeVisible()

  await screen.unmount()
  expect(screen.container.innerHTML).toBe('')
})
