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

  return {
    baseElement,
    component,
    container,
    locator,
    rerender,
    unmount,
    debug: (el = baseElement) => {
      debug(el)
    },
    ...queries,
  }
}

export { cleanup, render }

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
