import { page } from 'vitest/browser'
import { beforeEach } from 'vitest'
import { cleanup, render, setup } from './pure.js'

export * from './pure.js'

page.extend({
  render,
  [Symbol.for('vitest:component-cleanup')]: cleanup,
})

beforeEach(async () => {
  cleanup()
  return setup()
})

declare module 'vitest/browser' {
  interface BrowserPage {
    render: typeof render
  }
}
