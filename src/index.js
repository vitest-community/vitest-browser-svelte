import { page } from 'vitest/browser'
import { beforeEach } from 'vitest'
import { cleanup, render } from './pure.js'

export { render, cleanup } from './pure.js'

page.extend({
  render,
  [Symbol.for('vitest:component-cleanup')]: cleanup,
})

beforeEach(() => {
  cleanup()
})
