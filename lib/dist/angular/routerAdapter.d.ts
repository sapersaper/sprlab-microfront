import type { RouterAdapter } from '../core/types';
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
/**
 * Creates a RouterAdapter from an Angular Router instance.
 * Works with @angular/router v15+.
 */
export declare function createAngularRouterAdapter(router: AngularRouter): RouterAdapter;
export {};
