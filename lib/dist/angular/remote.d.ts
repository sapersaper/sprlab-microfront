import type { RemoteConnection } from '../core/types';
interface AngularRouter {
    url: string;
    navigateByUrl(url: string, extras?: {
        replaceUrl?: boolean;
    }): Promise<boolean>;
    events: {
        subscribe(callback: (event: any) => void): {
            unsubscribe(): void;
        };
    };
}
export interface AngularRemoteOptions {
    /** Identifier sent as metadata with messages to the shell */
    appName?: string;
    /** Angular Router instance for route synchronization */
    router?: AngularRouter;
    /** Allowed origins for postMessage security. Defaults to ['*'] */
    allowedOrigins?: string[];
}
/**
 * Initialize an Angular remote micro frontend.
 * Returns a RemoteConnection with send/onMessage, or null if not in an iframe.
 *
 * Usage:
 *   import { initAngularRemote } from '@sprlab/microfront/angular/remote'
 *   const connection = initAngularRemote({ appName: 'my-app', router: this.router })
 */
export declare function initAngularRemote(options?: AngularRemoteOptions): RemoteConnection | null;
export { createAngularRouterAdapter } from './routerAdapter';
export type { RemoteConnection } from '../core/types';
