import { LocatorSelectors, Locator } from 'vitest/browser'
import type { Component, ComponentImport, ComponentOptions, Exports, Rerender, SetupOptions } from '@testing-library/svelte-core/types'

export type { Component, ComponentImport, ComponentOptions, Exports, Rerender, SetupOptions } from '@testing-library/svelte-core/types'

/**
 * The rendered component and bound testing functions.
 */
export interface RenderResult<C extends Component> extends LocatorSelectors {
    container: HTMLElement;
    baseElement: HTMLElement;
    component: Exports<C>;
    debug: (el?: HTMLElement) => void;
    /**
     * Update the component props. Also records a `svelte.rerender` trace mark.
     *
     * Synchronous usage is deprecated and will be removed in the next major version.
     * Please use `await rerender(props)` instead of `rerender(props)`.
     */
    rerender: Rerender<C>;
    /**
     * Unmount the component. Also records a `svelte.unmount` trace mark.
     *
     * Synchronous usage is deprecated and will be removed in the next major version.
     * Please use `await unmount()` instead of `unmount()`.
     */
    unmount: () => Promise<void>;
    locator: Locator;
}

/** Unmount all components and remove elements added to `<body>`. */
export function cleanup(): void;

/**
 * Render a Svelte component into the document.
 * Also records a `svelte.render` trace mark.
 *
 * Synchronous usage is deprecated and will be removed in the next major version.
 * Please use `await render(Component)` instead of `render(Component)`.
 */
export function render<C extends Component>(Component: ComponentImport<C>, options?: ComponentOptions<C>, renderOptions?: SetupOptions): RenderResult<C> & PromiseLike<RenderResult<C>>;

declare module 'vitest/browser' {
  interface BrowserPage {
    render: typeof render
  }
}
