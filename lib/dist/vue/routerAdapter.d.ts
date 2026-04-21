import type { RouterAdapter } from '../core/types';
/**
 * Creates a RouterAdapter from a Vue Router instance.
 * Compatible with Vue Router v3 (Nuxt 2), v4, and v5.
 */
export declare function createVueRouterAdapter(router: any): RouterAdapter;
