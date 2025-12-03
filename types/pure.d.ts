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
    rerender: Rerender<C>;
    unmount: () => void;
    locator: Locator;
}

/** Unmount all components and remove elements added to `<body>`. */
export function cleanup(): void;

/**
 * Render a component into the document.
 */
export function render<C extends Component>(Component: ComponentImport<C>, options?: ComponentOptions<C>, renderOptions?: SetupOptions): RenderResult<C>;

declare module 'vitest/browser' {
  interface BrowserPage {
    render: typeof render
  }
}
