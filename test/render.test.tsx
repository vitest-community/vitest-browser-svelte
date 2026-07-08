import { expect, test } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-svelte'
import HelloWorld from './fixtures/HelloWorld.svelte'
import Counter from './fixtures/Counter.svelte'
import Wrapper from './fixtures/Wrapper.svelte'

test('renders simple component', async () => {
  const screen = await render(HelloWorld)
  await expect.element(page.getByText('Hello World')).toBeVisible()
  expect(screen.container).toMatchSnapshot()
})

test('renders counter', async () => {
  const screen = await render(Counter, {
    initialCount: 1,
  })

  await expect.element(screen.getByText('Count is 1')).toBeVisible()
  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('Count is 2')).toBeVisible()
})

test('renders component in wrapper', async () => {
  const screen = await render(
    HelloWorld,
    {},
    { wrapper: Wrapper, wrapperProps: { heading: 'wrapper' } },
  )
  await expect
    .element(screen.getByRole('heading', { name: 'wrapper' }))
    .toBeVisible()
  await expect.element(screen.getByText('Hello World')).toBeVisible()
})

test('trace mark', async () => {
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
