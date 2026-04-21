/**
 * Patches window.history.pushState to call replaceState instead,
 * preventing duplicate history entries inside iframes.
 */
export function patchHistoryPushState(): void {
  window.history.pushState = (data: any, unused: string, url?: string | URL | null) => {
    window.history.replaceState(data, unused, url)
  }
}
