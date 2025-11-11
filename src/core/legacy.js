/**
 * Legacy rendering core for svelte-testing-library.
 *
 * Supports Svelte <= 4.
 */

/** Allowed options for the component constructor. */
const allowedOptions = [
  'target',
  'accessors',
  'anchor',
  'props',
  'hydrate',
  'intro',
  'context',
]

/**
 * Mount the component into the DOM.
 *
 * The `onDestroy` callback is included for strict backwards compatibility
 * with previous versions of this library. It's mostly unnecessary logic.
 */
function mount(Component, options, onDestroy) {
  const component = new Component(options)

  if (typeof onDestroy === 'function') {
    component.$$.on_destroy.push(() => {
      onDestroy(component)
    })
  }

  return component
}

/** Remove the component from the DOM. */
function unmount(component) {
  component.$destroy()
}

export { allowedOptions, mount, unmount }
