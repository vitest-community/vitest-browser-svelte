import { type Locator, type LocatorSelectors, page, server, utils } from 'vitest/browser'
import { cleanup, render as coreRender, wrapperSetup } from '@testing-library/svelte-core'
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
  /** Unmount the component and record a `svelte.unmount` trace mark. */
  unmount: () => Promise<void>
  locator: Locator
}

/**
 * Render a component into the document and record a `svelte.render` trace mark.
 *
 * @param Component - The component to render.
 * @param options - Customize how Svelte renders the component.
 * @param renderOptions - Customize how the document and queries are set up.
 * @returns The rendered component and bound testing functions.
 */
async function render<C extends Component, W extends Component = never>(Component: ComponentImport<C>, options: ComponentOptions<C> = {}, renderOptions: SetupOptions<W> = {}): Promise<RenderResult<C, W>> {
  if (renderOptions.wrapper) {
    await wrapperSetup()
  }

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

async function mark(locator: Locator, name: string, fn: Function): Promise<void> {
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

function ensureTestIdAttribute(element: HTMLElement) {
  const attributeId = server.config.browser.locators.testIdAttribute
  if (!element.hasAttribute(attributeId)) {
    element.setAttribute(attributeId, `__vitest_${idx++}__`)
  }
}

export { cleanup, render, type RenderResult }
export type { Component, ComponentImport, ComponentOptions, Exports, Rerender, SetupOptions } from '@testing-library/svelte-core/types'
