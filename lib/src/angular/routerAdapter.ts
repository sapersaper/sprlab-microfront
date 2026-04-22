import type { RouterAdapter } from '../core/types'

interface AngularRouter {
  url: string
  navigateByUrl(url: string, extras?: { replaceUrl?: boolean }): Promise<boolean>
  events: {
    subscribe(callback: (event: any) => void): { unsubscribe(): void }
  }
}

/**
 * Creates a RouterAdapter from an Angular Router instance.
 * Works with @angular/router v15+.
 */
export function createAngularRouterAdapter(router: AngularRouter): RouterAdapter {
  return {
    getCurrentPath() {
      return router.url
    },
    replace(path: string) {
      router.navigateByUrl(path, { replaceUrl: true })
    },
    afterEach(callback: (path: string) => void) {
      router.events.subscribe((event: any) => {
        // NavigationEnd has id=1 type, but we check by constructor name to avoid importing Angular
        if (event.constructor?.name === 'NavigationEnd' || event.type === 1) {
          callback(event.urlAfterRedirects || event.url)
        }
      })
    },
  }
}
