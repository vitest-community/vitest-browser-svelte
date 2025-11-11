/**
 * Modern rendering core for svelte-testing-library.
 *
 * Supports Svelte >= 5.
 */
import * as Svelte from 'svelte'

/** Props signals for each rendered component. */
const propsByComponent = new Map()

/** Whether we're using Svelte >= 5. */
const IS_MODERN_SVELTE = typeof Svelte.mount === 'function'

/** Allowed options to the `mount` call. */
const allowedOptions = [
  'target',
  'anchor',
  'props',
  'events',
  'context',
  'intro',
]

/** Mount the component into the DOM. */
function mount(Component, options) {
  const props = options.props ?? {}
  const component = Svelte.mount(Component, { ...options, props })

  Svelte.flushSync()
  propsByComponent.set(component, props)

  return component
}

/** Remove the component from the DOM. */
function unmount(component) {
  propsByComponent.delete(component)
  Svelte.flushSync(() => Svelte.unmount(component))
}

export { allowedOptions, IS_MODERN_SVELTE, mount, unmount }
