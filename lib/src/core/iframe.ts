/**
 * Returns true if the current window is inside an iframe.
 */
export function isInsideIframe(): boolean {
  return window.self !== window.parent
}
