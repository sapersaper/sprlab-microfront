import type { RouterAdapter } from '../core/types'

/**
 * Creates a RouterAdapter from a Vue Router instance.
 * Compatible with Vue Router v3 (Nuxt 2), v4, and v5.
 */
export function createVueRouterAdapter(router: any): RouterAdapter {
  return {
    getCurrentPath(): string {
      // Vue Router v4/v5: currentRoute is a ref
      // Vue Router v3: currentRoute is a plain object
      return router.currentRoute?.value?.fullPath
        ?? router.currentRoute?.fullPath
        ?? '/'
    },

    replace(path: string): void {
      router.replace(path)
    },

    afterEach(callback: (path: string) => void): void {
      if (typeof router.afterEach === 'function') {
        router.afterEach((to: any) => {
          callback(to.fullPath)
        })
      }
    },
  }
}
