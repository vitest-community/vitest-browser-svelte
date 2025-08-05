// @ts-check

import * as Svelte from 'svelte'
import { debug, getElementLocatorSelectors } from '@vitest/browser/utils'

import { page } from '@vitest/browser/context'
import { mount, unmount, updateProps, validateOptions } from './core/index.js'

/**
 * @type {Set<Element>}
 */
const targetCache = new Set()
/**
 * @type {Set<import('svelte').SvelteComponent>}
 */
const componentCache = new Set()

/**
 * Customize how Svelte renders the component.
 *
 * @template {import('svelte').SvelteComponent} C
 * @typedef {import('svelte').ComponentProps<C> | Partial<import('svelte').ComponentConstructorOptions<import('svelte').ComponentProps<C>>>} SvelteComponentOptions
 */

/**
 * Customize how Testing Library sets up the document and binds queries.
 *
 * @typedef {{
 *   baseElement?: HTMLElement
 * }} RenderOptions
 */

/**
 * The rendered component and bound testing functions.
 *
 * @template {import('svelte').SvelteComponent} C
 *
 * @typedef {{
 *   container: HTMLElement
 *   baseElement: HTMLElement
 *   component: C
 *   debug: (el?: HTMLElement) => void
 *   rerender: (props: Partial<import('svelte').ComponentProps<C>>) => Promise<void>
 *   unmount: () => void
 *   locator: import('@vitest/browser/context').Locator
 * } & import('@vitest/browser/context').LocatorSelectors} RenderResult
 */

/**
 * Render a component into the document.
 *
 * @template {import('svelte').SvelteComponent} C
 *
 * @param {import('../types/pure.js').ComponentType<C>} Component - The component to render.
 * @param {SvelteComponentOptions<C>} options - Customize how Svelte renders the component.
 * @param {RenderOptions} renderOptions - Customize how Testing Library sets up the document and binds queries.
 * @returns {RenderResult<C>} The rendered component and bound testing functions.
 */
function render(Component, options = {}, renderOptions = {}) {
  options = validateOptions(options)

  const baseElement
    = renderOptions.baseElement ?? options.target ?? document.body

  const queries = getElementLocatorSelectors(baseElement)

  const target
    = options.target ?? baseElement.appendChild(document.createElement('div'))

  targetCache.add(target)

  const component = mount(
    'default' in Component ? Component.default : Component,
    { ...options, target },
    cleanupComponent,
  )

  componentCache.add(component)

  return {
    baseElement,
    component,
    container: target,
    locator: page.elementLocator(target),
    debug: (el = baseElement) => {
      debug(el)
    },
    rerender: async (props) => {
      if (props.props) {
        console.warn(
          'rerender({ props: {...} }) deprecated, use rerender({...}) instead',
        )
        props = props.props
      }

      updateProps(component, props)
      await Svelte.tick()
    },
    unmount: () => {
      cleanupComponent(component)
    },
    ...queries,
  }
}

/**
 * Remove a component from the component cache.
 * @param {import('svelte').SvelteComponent} component
 */
function cleanupComponent(component) {
  const inCache = componentCache.delete(component)

  if (inCache) {
    unmount(component)
  }
}

/**
 * Remove a target element from the target cache
 * @param {Element} target
 */
function cleanupTarget(target) {
  const inCache = targetCache.delete(target)

  if (inCache) {
    document.body.removeChild(target)
  }
}

/** Unmount all components and remove elements added to `<body>`. */
function cleanup() {
  componentCache.forEach(cleanupComponent)
  targetCache.forEach(cleanupTarget)
}

export { cleanup, render }
