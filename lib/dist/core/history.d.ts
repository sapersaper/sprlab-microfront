/**
 * Patches window.history.pushState to call replaceState instead,
 * preventing duplicate history entries inside iframes.
 */
export declare function patchHistoryPushState(): void;
