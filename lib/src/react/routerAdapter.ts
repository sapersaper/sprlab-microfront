import type { RouterAdapter } from '../core/types'

interface ReactRouter {
  state: { location: { pathname: string } }
  navigate(path: string, opts?: { replace?: boolean }): void
  subscribe(callback: (state: { location: { pathname: string } }) => void): void
}

/**
 * Creates a RouterAdapter from a React Router instance (v6+/v7).
 * Works with createBrowserRouter from react-router-dom.
 */
export function createReactRouterAdapter(router: ReactRouter): RouterAdapter {
  return {
    getCurrentPath() {
      return router.state.location.pathname
    },
    replace(path: string) {
      router.navigate(path, { replace: true })
    },
    afterEach(callback: (path: string) => void) {
      router.subscribe((state) => {
        callback(state.location.pathname)
      })
    },
  }
}
