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
 * Synchronous usage is deprecated and will be removed in the next major version.
 * Please use `await render(Component)` instead of `render(Component)`.
 *
 * @template {import('@testing-library/svelte-core/types').Component} C
 *
 * @param {import('@testing-library/svelte-core/types').ComponentImport<C>} Component - The component to render.
 * @param {import('@testing-library/svelte-core/types').ComponentOptions<C>} options - Customize how Svelte renders the component.
 * @param {import('@testing-library/svelte-core/types').SetupOptions} renderOptions - Customize how the document and queries are set up.
 * @returns {RenderResult<C>} The rendered component and bound testing functions.
 */
function render(Component, options = {}, renderOptions = {}) {
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
      await markThenable(locator, 'svelte.rerender', result.rerender, undefined)
    },
    unmount: () => {
      unmount()
      return markThenable(locator, 'svelte.unmount', result.unmount, undefined)
    },
    debug: (el = baseElement) => {
      debug(el)
    },
    ...queries,
  }
  return { ...result, ...markThenable(locator, 'svelte.render', render, result) }
}

export { cleanup, render }

/**
 * @template T
 * @param {import('vitest/browser').Locator} locator
 * @param {string} name
 * @param {Function} fn
 * @param {T} value
 * @returns {PromiseLike<T>}
 */
function markThenable(locator, name, fn, value) {
  if (!locator.mark) {
    return { then: (/** @type {any} */ f) => f?.(value) }
  }
  const error = new Error(name)
  if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(error, fn)
  }
  return {
    async then(onfulfilled, onrejected) {
      try {
        await locator.mark(name, error)
        return Promise.resolve(value).then(onfulfilled, onrejected)
      }
      catch (e) {
        return Promise.reject(e).then(onfulfilled, onrejected)
      }
    },
  }
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
