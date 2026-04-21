/**
 * Observes document.documentElement height via ResizeObserver
 * and calls `onHeight` with the scrollHeight whenever it changes.
 * Returns a cleanup function that disconnects the observer.
 */
export declare function observeContentHeight(onHeight: (height: number) => void): () => void;
