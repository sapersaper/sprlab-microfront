/**
 * Observes document.documentElement height via ResizeObserver
 * and calls `onHeight` with the scrollHeight whenever it changes.
 * Returns a cleanup function that disconnects the observer.
 */
export function observeContentHeight(onHeight: (height: number) => void): () => void {
  let lastHeight = 0

  const check = () => {
    const height = document.documentElement.scrollHeight
    if (height !== lastHeight) {
      lastHeight = height
      onHeight(height)
    }
  }

  const observer = new ResizeObserver(check)
  observer.observe(document.documentElement)
  observer.observe(document.body)

  // Send initial height
  check()

  return () => observer.disconnect()
}
