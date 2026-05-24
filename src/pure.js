// @ts-check

import { page, server, utils } from 'vitest/browser'
import { cleanup, render as coreRender } from '@testing-library/svelte-core'

const { debug, getElementLocatorSelectors } = utils

/**
 * The rendered component and bound testing functions.
 *
 * @template {import('@testing-library/svelte-core/types').Component} C
 *
 * @typedef {{
 *   container: HTMLElement
 *   baseElement: HTMLElement
 *   component: import('@testing-library/svelte-core/types').Exports<C>
 *   debug: (el?: HTMLElement) => void
 *   rerender: import('@testing-library/svelte-core/types').Rerender<C>
 *   unmount: () => void
 *   locator: import('vitest/browser').Locator
 * } & import('vitest/browser').LocatorSelectors} RenderResult
 */

/**
 * Render a component into the document.
 * Also records a `svelte.render` trace mark.
 *
 * @template {import('@testing-library/svelte-core/types').Component} C
 *
 * @param {import('@testing-library/svelte-core/types').ComponentImport<C>} Component - The component to render.
 * @param {import('@testing-library/svelte-core/types').ComponentOptions<C>} options - Customize how Svelte renders the component.
 * @param {import('@testing-library/svelte-core/types').SetupOptions} renderOptions - Customize how the document and queries are set up.
 * @returns {Promise<RenderResult<C>>} The rendered component and bound testing functions.
 */
async function render(Component, options = {}, renderOptions = {}) {
  const { baseElement, container, component, rerender, unmount } = coreRender(Component, options, renderOptions)
  ensureTestIdAttribute(baseElement)
  ensureTestIdAttribute(container)

  const queries = getElementLocatorSelectors(baseElement)
  const locator = page.elementLocator(container)

  const result = {
    baseElement,
    component,
    container,
    locator,
    rerender: async (/** @type {any} */ props) => {
      await rerender(props)
      await mark(locator, 'svelte.rerender', result.rerender)
    },
    unmount: async () => {
      unmount()
      await mark(locator, 'svelte.unmount', result.unmount)
    },
    debug: (el = baseElement) => {
      debug(el)
    },
    ...queries,
  }
  await mark(locator, 'svelte.render', render)
  return result
}

export { cleanup, render }

/**
 * @param {import('vitest/browser').Locator} locator
 * @param {string} name
 * @param {Function} fn
 * @returns {Promise<void>}
 */
async function mark(locator, name, fn) {
  if (!locator.mark) {
    return
  }
  const error = new Error(name)
  if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(error, fn)
  }
  await locator.mark(name, error)
}

let idx = 0
/**
 * @param {HTMLElement} element
 */
function ensureTestIdAttribute(element) {
  const attributeId = server.config.browser.locators.testIdAttribute
  if (!element.hasAttribute(attributeId)) {
    element.setAttribute(attributeId, `__vitest_${idx++}__`)
  }
}
