// @ts-check

import { type Locator, type LocatorSelectors, page, server, utils } from 'vitest/browser'
import { cleanup, render as coreRender, wrapperSetup as setup } from '@testing-library/svelte-core'
import type { Component, ComponentImport, ComponentOptions, Exports, Rerender, SetupOptions } from '@testing-library/svelte-core/types'

const { debug, getElementLocatorSelectors } = utils

/** The rendered component and bound testing functions. */
interface RenderResult<C extends Component, W extends Component = never> extends LocatorSelectors {
  container: HTMLElement
  baseElement: HTMLElement
  component: Exports<C>
  wrapper: Exports<W>
  debug: (el?: HTMLElement) => void
  /** Update the component props and record a `svelte.rerender` trace mark. */
  rerender: Rerender<C>
  /**
   * Unmount the component and record a `svelte.unmount` trace mark.
   *
   * Synchronous usage is deprecated and will be removed in the next major version.
   * Please use `await unmount()` instead of `unmount()`.
   */
  unmount: () => PromiseLike<void>
  locator: Locator
}

/**
 * Render a component into the document and record a `svelte.render` trace mark.
 *
 * Synchronous usage is deprecated and will be removed in the next major version.
 * Please use `await render(Component)` instead of `render(Component)`.
 *
 * @template {import('@testing-library/svelte-core/types').Component} C
 * @template {import('@testing-library/svelte-core/types').Component} [W=never]
 *
 * @param {import('@testing-library/svelte-core/types').ComponentImport<C>} Component - The component to render.
 * @param {import('@testing-library/svelte-core/types').ComponentOptions<C>} options - Customize how Svelte renders the component.
 * @param {import('@testing-library/svelte-core/types').SetupOptions<W>} renderOptions - Customize how the document and queries are set up.
 * @returns {RenderResult<C, W>} The rendered component and bound testing functions.
 */
function render<C extends Component, W extends Component = never>(Component: ComponentImport<C>, options: ComponentOptions<C> = {}, renderOptions: SetupOptions<W> = {}): RenderResult<C, W> & PromiseLike<RenderResult<C, W>> {
  const { baseElement, container, component, wrapper, rerender, unmount } = coreRender(Component, options, renderOptions)
  ensureTestIdAttribute(baseElement)
  ensureTestIdAttribute(container)

  const queries = getElementLocatorSelectors(baseElement)
  const locator = page.elementLocator(container)

  const result: RenderResult<C, W> = {
    baseElement,
    component,
    wrapper,
    container,
    locator,
    rerender: async (props) => {
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

export { cleanup, render, setup }
export type { Component, ComponentImport, ComponentOptions, Exports, Rerender, SetupOptions } from '@testing-library/svelte-core/types'

/**
 * @template T
 * @param {import('vitest/browser').Locator} locator
 * @param {string} name
 * @param {Function} fn
 * @param {T} value
 * @returns {PromiseLike<T>}
 */
function markThenable<T>(locator: Locator, name: string, fn: Function, value: T): PromiseLike<T> {
  if (!locator.mark) {
    return { then: (f: any) => f?.(value) }
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
function ensureTestIdAttribute(element: HTMLElement) {
  const attributeId = server.config.browser.locators.testIdAttribute
  if (!element.hasAttribute(attributeId)) {
    element.setAttribute(attributeId, `__vitest_${idx++}__`)
  }
}
